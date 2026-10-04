import { FIXED_FOR_TERM } from './banks/bank';
import {
  BABAVARO,
  CSOK_PLUSZ,
  FALUSI_CSOK_LOAN,
  GOV_PROGRAM,
  INCOMPATIBLE_PROGRAMS,
  LOAN_PROGRAMS,
  MAX_COUNTED_CHILDREN,
  MNB_LIMITS,
  MONTHS_PER_YEAR,
  MORTGAGE_FORGIVENESS,
  OTTHON_START,
  STAMP_DUTY,
  type GovProgram
} from './constants';
import {
  checkEligibility,
  normalizeInput,
  type Eligibility,
  type HouseholdInput
} from './eligibility';
import { buildSchedule, type LoanEvent, type Schedule, type Tranche } from './schedule';
import { DEFAULT_SETTINGS, type OfferSetting, type PlanSettings } from './settings';
import { formatMillions } from './utils/currency';
import { addMonths, monthsBetween } from './utils/date';
import { arrangements, clamp, formatPercent } from './utils/math';

export type PlannedLoan = {
  id: string;
  name: string;
  amount: number;
  annualRate: number;
  termMonths: number;
  initialMonthly: number;
  totalPaid: number;
  totalForgiven: number;
  note: string;
};

export type PlanTimelineEntry = {
  month: string;
  titles: string[];
  monthlyAfter: number;
};

export type Plan = {
  loans: PlannedLoan[];
  grant: number;
  subsidy: number;
  stampDuty: number;
  paymentToIncome: number;
  paymentToIncomeLimit: number;
  schedule: Schedule;
  timeline: PlanTimelineEntry[];
  eligibility: Eligibility[];
  warnings: string[];
  tips: string[];
};

export const buildPlan = (
  rawInput: HouseholdInput,
  settings: PlanSettings = DEFAULT_SETTINGS
): Plan => {
  const input = normalizeInput(rawInput);
  const eligibility = checkEligibility(input);
  const maxAmount = (program: GovProgram): number => {
    return eligibility.find((item) => item.program === program)?.maxAmount ?? 0;
  };
  const grant = maxAmount(GOV_PROGRAM.FALUSI_CSOK);
  const context: Context = {
    input,
    settings,
    eligibility,
    maxAmount,
    grant,
    need: Math.max(0, input.propertyPrice - input.ownFunds - grant),
    bankOffer: cheapestOffer(settings.offers, (offer) => offer.kind !== 'OTTHON_START'),
    otthonStartOffer: cheapestOffer(settings.offers, (offer) => offer.kind === 'OTTHON_START')
  };
  const loanPrograms = LOAN_PROGRAMS.filter((program) => maxAmount(program) > 0);

  // Fill order changes how much each loan gets, so every order of every legal set is priced.
  const [best] = arrangements(loanPrograms)
    .filter(isCompatible)
    .map((programs) => evaluate(context, programs))
    .toSorted(compareEvaluations);
  return (best ?? evaluate(context, [])).plan;
};

type Context = {
  input: HouseholdInput;
  settings: PlanSettings;
  eligibility: Eligibility[];
  maxAmount: (program: GovProgram) => number;
  grant: number;
  need: number;
  bankOffer: OfferSetting | undefined;
  otthonStartOffer: OfferSetting | undefined;
};

type PlanTranche = Tranche & { note: string; isBank: boolean; fixationYears: number };

type Evaluation = { plan: Plan; shortfall: number };

const evaluate = (context: Context, programs: GovProgram[]): Evaluation => {
  const { input, settings } = context;
  const loanToValue = input.firstHome ? MNB_LIMITS.firstBuyerLoanToValue : MNB_LIMITS.loanToValue;
  let remaining = context.need;
  let mortgageRoom = input.propertyPrice * loanToValue;
  const tranches: PlanTranche[] = [];

  for (const program of programs) {
    const isMortgage = program !== GOV_PROGRAM.BABAVARO;
    const amount = Math.min(
      remaining,
      context.maxAmount(program),
      isMortgage ? mortgageRoom : Infinity
    );
    if (amount <= 0) continue;
    remaining -= amount;
    if (isMortgage) mortgageRoom -= amount;
    tranches.push(govTranche(context, program, amount));
  }

  if (remaining > 0 && mortgageRoom > 0 && context.bankOffer) {
    const amount = Math.min(remaining, mortgageRoom);
    remaining -= amount;
    tranches.push(bankTranche(context, amount, context.bankOffer));
  }

  addMortgageForgiveness(input, tranches);

  const schedule = buildSchedule(tranches, {
    discountRate: settings.bondYield,
    inflationRate: settings.inflationRate
  });
  const paymentToIncomeLimit = jtmLimit(input, tranches);
  const paymentToIncome =
    input.netIncome > 0 ? schedule.initialMonthly / input.netIncome : Infinity;
  const exemptPrograms = context.grant > 0 ? [...programs, GOV_PROGRAM.FALUSI_CSOK] : programs;

  return {
    shortfall: remaining,
    plan: {
      loans: tranches.map((tranche, index) => {
        const trancheSchedule = schedule.tranches[index];
        return {
          id: tranche.id,
          name: tranche.name,
          amount: tranche.principal,
          annualRate: tranche.annualRate,
          termMonths: tranche.termMonths,
          initialMonthly: trancheSchedule?.initialPayment ?? 0,
          totalPaid: trancheSchedule?.totalPaid ?? 0,
          totalForgiven: trancheSchedule?.totalForgiven ?? 0,
          note: tranche.note
        };
      }),
      grant: context.grant,
      subsidy: schedule.totalForgiven + context.grant,
      stampDuty: stampDuty(input, exemptPrograms),
      paymentToIncome,
      paymentToIncomeLimit,
      schedule,
      timeline: timeline(input, schedule),
      eligibility: context.eligibility,
      warnings: [
        ...(remaining > 0
          ? ['A hitelek nem fedezik a teljes vételárat, több önerő szükséges']
          : []),
        ...(paymentToIncome > paymentToIncomeLimit
          ? ['A törlesztőrészlet meghaladja a jövedelemarányos (JTM) korlátot']
          : []),
        ...(programs.includes(GOV_PROGRAM.BABAVARO)
          ? ['A Babaváró önerőként való elfogadása bankfüggő']
          : []),
        ...(remaining > 0 && !context.bankOffer
          ? ['Nincs bekapcsolt banki ajánlat a kiegészítő hitelhez']
          : [])
      ],
      tips: tips(settings, tranches, schedule)
    }
  };
};

const govTranche = (context: Context, program: GovProgram, amount: number): PlanTranche => {
  const { input, settings } = context;
  const desiredMonths = input.termYears * MONTHS_PER_YEAR;
  // Decrees cap the borrower's rate; banks and users may only go below it.
  const csokPluszRate = Math.min(settings.csokPluszRate, CSOK_PLUSZ.annualRate);
  const falusiCsokLoanRate = Math.min(settings.falusiCsokLoanRate, FALUSI_CSOK_LOAN.annualRate);
  const base = { id: program, principal: amount, isBank: false, fixationYears: FIXED_FOR_TERM };

  if (program === GOV_PROGRAM.BABAVARO) {
    const minMonths = Math.ceil(amount / BABAVARO.maxMonthlyPayment);
    return {
      ...base,
      name: BABAVARO.name,
      annualRate: BABAVARO.annualRate,
      termMonths: clamp(
        minMonths,
        BABAVARO.minTermYears * MONTHS_PER_YEAR,
        BABAVARO.maxTermYears * MONTHS_PER_YEAR
      ),
      events: babavaroEvents(input),
      note: `Kamatmentes, gyermekenként ${BABAVARO.suspensionMonthsPerChild / MONTHS_PER_YEAR} év szüneteltetés, a 2. gyermeknél ${formatPercent(BABAVARO.forgivenessRateByChild[2] ?? 0)}, a 3.-nál teljes elengedés`
    };
  }

  if (program === GOV_PROGRAM.CSOK_PLUSZ) {
    return {
      ...base,
      name: CSOK_PLUSZ.name,
      annualRate: csokPluszRate,
      termMonths: clamp(
        desiredMonths,
        CSOK_PLUSZ.minTermYears * MONTHS_PER_YEAR,
        CSOK_PLUSZ.maxTermYears * MONTHS_PER_YEAR
      ),
      events: csokPluszEvents(input),
      note: `Fix ${formatPercent(csokPluszRate)}, a ${CSOK_PLUSZ.forgivenessFromChildOrder}. gyermektől gyermekenként ${formatMillions(CSOK_PLUSZ.forgivenessPerChild)} elengedés`
    };
  }

  if (program === GOV_PROGRAM.OTTHON_START) {
    const offer = context.otthonStartOffer;
    const annualRate = Math.min(
      offer?.annualRate ?? OTTHON_START.annualRate,
      OTTHON_START.annualRate
    );
    return {
      ...base,
      name: offer ? `${OTTHON_START.name} (${offer.bankName})` : OTTHON_START.name,
      annualRate,
      termMonths: Math.min(desiredMonths, OTTHON_START.maxTermYears * MONTHS_PER_YEAR),
      events: [],
      note: `Fix ${formatPercent(annualRate)} a teljes futamidőre`
    };
  }

  return {
    ...base,
    name: FALUSI_CSOK_LOAN.name,
    annualRate: falusiCsokLoanRate,
    termMonths: Math.min(desiredMonths, FALUSI_CSOK_LOAN.maxTermYears * MONTHS_PER_YEAR),
    events: [],
    note: `Fix ${formatPercent(falusiCsokLoanRate)} a teljes futamidőre`
  };
};

// Babaváró counts only children born after disbursement.
const babavaroEvents = (input: HouseholdInput): LoanEvent[] => {
  return birthsAfterStart(input)
    .slice(0, MAX_COUNTED_CHILDREN)
    .flatMap((month, index): LoanEvent[] => {
      const order = index + 1;
      const share = BABAVARO.forgivenessRateByChild[order] ?? 0;
      const forgive: LoanEvent[] =
        share > 0
          ? [
              {
                month,
                type: 'forgiveShare',
                share,
                reason: `${order}. gyermek: ${formatPercent(share)} elengedés`
              }
            ]
          : [];
      const suspend: LoanEvent[] =
        (BABAVARO.suspendingChildren as readonly number[]).includes(order) && share < 1
          ? [
              {
                month,
                type: 'suspend',
                months: BABAVARO.suspensionMonthsPerChild,
                optional: true,
                reason: `${order}. gyermek: szüneteltetés ${BABAVARO.suspensionMonthsPerChild / MONTHS_PER_YEAR} évre`
              }
            ]
          : [];
      return [...forgive, ...suspend];
    });
};

// CSOK Plusz counts every child for the order, but only births after the contract trigger events.
const csokPluszEvents = (input: HouseholdInput): LoanEvent[] => {
  const existing = input.childrenBirthMonths.length;
  return birthsAfterStart(input).map((month, index): LoanEvent => {
    const order = existing + index + 1;
    if (order >= CSOK_PLUSZ.forgivenessFromChildOrder) {
      return {
        month,
        type: 'forgive',
        amount: CSOK_PLUSZ.forgivenessPerChild,
        reason: `${order}. gyermek: ${formatMillions(CSOK_PLUSZ.forgivenessPerChild)} elengedés`
      };
    }
    return {
      month,
      type: 'suspend',
      months: CSOK_PLUSZ.firstChildSuspensionMonths,
      optional: true,
      reason: `${order}. gyermek: ${CSOK_PLUSZ.firstChildSuspensionMonths} hónap szüneteltetés`
    };
  });
};

const bankTranche = (context: Context, amount: number, offer: OfferSetting): PlanTranche => {
  const { repriceRate } = context.settings;
  const termMonths = context.input.termYears * MONTHS_PER_YEAR;
  const fixationMonths =
    offer.fixationYears === FIXED_FOR_TERM ? termMonths : offer.fixationYears * MONTHS_PER_YEAR;
  const events: LoanEvent[] =
    fixationMonths < termMonths
      ? [
          {
            month: fixationMonths,
            type: 'reprice',
            annualRate: repriceRate,
            reason: `Kamatperiódus vége, átárazás ${formatPercent(repriceRate)} kamatra`
          }
        ]
      : [];
  return {
    id: `bank-${offer.id}`,
    name: `${offer.bankName} ${offer.product}`,
    principal: amount,
    annualRate: offer.annualRate,
    termMonths,
    events,
    isBank: true,
    fixationYears: offer.fixationYears,
    note:
      offer.fixationYears === FIXED_FOR_TERM
        ? 'Végig fix kamat'
        : `${offer.fixationYears} év kamatfixálás, utána ${formatPercent(repriceRate)} (becslés)`
  };
};

// Applied to the subsidized mortgage first; CSOK Plusz already forgives per child, Babaváró is not a mortgage.
const addMortgageForgiveness = (input: HouseholdInput, tranches: PlanTranche[]): void => {
  const target =
    tranches.find((tranche) => tranche.id === GOV_PROGRAM.OTTHON_START) ??
    tranches.find((tranche) => tranche.isBank) ??
    tranches.find((tranche) => tranche.id === GOV_PROGRAM.FALUSI_CSOK_LOAN);
  if (!target) return;
  const existing = input.childrenBirthMonths.length;
  birthsAfterStart(input).forEach((month, index) => {
    const order = existing + index + 1;
    const amount =
      MORTGAGE_FORGIVENESS.amountByChildOrder[order] ?? MORTGAGE_FORGIVENESS.amountForFurtherChild;
    if (amount === 0) return;
    target.events.push({
      month,
      type: 'forgive',
      amount,
      reason: `${order}. gyermek: jelzáloghitel-elengedés (${formatMillions(amount)})`
    });
  });
};

const birthsAfterStart = (input: HouseholdInput): number[] => {
  return input.plannedChildrenMonths.map((month) => monthsBetween(input.startMonth, month));
};

// The strictest band applies: a short bank fixation pulls the whole plan into a lower JTM limit.
const jtmLimit = (input: HouseholdInput, tranches: PlanTranche[]): number => {
  const column = input.netIncome >= MNB_LIMITS.incomeThreshold ? 1 : 0;
  const fixation = Math.min(
    ...tranches.map((tranche) =>
      tranche.fixationYears === FIXED_FOR_TERM ? Infinity : tranche.fixationYears
    )
  );
  const row =
    fixation < MNB_LIMITS.fixationYears.medium
      ? 'UNDER_5_YEARS'
      : fixation < MNB_LIMITS.fixationYears.long
        ? 'FROM_5_TO_10_YEARS'
        : 'FROM_10_YEARS';
  return MNB_LIMITS.paymentToIncomeByFixation[row][column];
};

const stampDuty = (input: HouseholdInput, programs: GovProgram[]): number => {
  const exemptWith: readonly GovProgram[] = STAMP_DUTY.exemptWith;
  if (programs.some((program) => exemptWith.includes(program))) return 0;
  if (
    input.propertyCondition === 'NEW' &&
    input.propertyPrice <= STAMP_DUTY.newHomeExemptionMaxValue
  ) {
    return Math.max(0, input.propertyPrice - STAMP_DUTY.newHomeExemptUpTo) * STAMP_DUTY.rate;
  }
  return input.propertyPrice * STAMP_DUTY.rate;
};

const timeline = (input: HouseholdInput, schedule: Schedule): PlanTimelineEntry[] => {
  const ends = schedule.tranches.map((trancheSchedule) => ({
    month: trancheSchedule.payments.length,
    reason: `${trancheSchedule.name} lejár`
  }));
  const entries = [
    { month: 0, reason: 'Folyósítás, törlesztés indul' },
    ...schedule.timeline.map((entry) => ({
      month: entry.month,
      reason: `${entry.loan}: ${entry.reason}`
    })),
    ...ends
  ].toSorted((a, b) => a.month - b.month);
  return [...Map.groupBy(entries, (entry) => entry.month)].map(([month, group]) => ({
    month: addMonths(input.startMonth, month),
    titles: group.map((entry) => entry.reason),
    monthlyAfter: schedule.monthlyTotals[month] ?? 0
  }));
};

// Cheap loans are worth keeping: savings earn more in government bonds than prepaying saves.
const tips = (settings: PlanSettings, tranches: PlanTranche[], schedule: Schedule): string[] => {
  const bondYield = formatPercent(settings.bondYield);
  const pauses = schedule.timeline
    .filter((entry) => entry.optional)
    .map(
      (entry) =>
        `${entry.loan}, ${entry.reason}: kérelemre jár, és megéri kérni, mert a hitel kamata az állampapírhozam (${bondYield}) alatt van. A megspórolt törlesztőt érdemes befektetni, például állampapírba vagy ETF-be.`
    );
  const keep = tranches
    .filter((tranche) => tranche.annualRate < settings.bondYield)
    .map(
      (tranche) =>
        `${tranche.name}: kamata (${formatPercent(tranche.annualRate)}) az állampapírhozam alatt van, előtörleszteni nem érdemes.`
    );
  return [...pauses, ...keep];
};

const cheapestOffer = (
  offers: OfferSetting[],
  matches: (offer: OfferSetting) => boolean
): OfferSetting | undefined => {
  return offers
    .filter((offer) => offer.enabled && matches(offer))
    .toSorted((a, b) => a.annualRate - b.annualRate)[0];
};

const compareEvaluations = (a: Evaluation, b: Evaluation): number => {
  const rank = ({ plan, shortfall }: Evaluation): number => {
    return (shortfall > 0 ? 2 : 0) + (plan.paymentToIncome > plan.paymentToIncomeLimit ? 1 : 0);
  };
  return (
    rank(a) - rank(b) ||
    a.shortfall - b.shortfall ||
    a.plan.schedule.presentValue - b.plan.schedule.presentValue
  );
};

const isCompatible = (programs: GovProgram[]): boolean => {
  return !INCOMPATIBLE_PROGRAMS.some(([a, b]) => programs.includes(a) && programs.includes(b));
};
