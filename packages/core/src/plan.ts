import { FIXED_FOR_TERM } from './banks/bank';
import {
  AMOUNT_SEARCH_STEP,
  BABAVARO,
  BALANCE_EPSILON,
  BANK_LOAN_PURPOSES,
  CSOK_PLUSZ,
  FALUSI_CSOK,
  FALUSI_CSOK_LOAN,
  GOV_PROGRAM,
  INCOMPATIBLE_PROGRAMS,
  LOAN_PROGRAMS,
  LOAN_PURPOSES,
  MAX_COUNTED_CHILDREN,
  MNB_LIMITS,
  MONTHS_PER_YEAR,
  MORTGAGE_FORGIVENESS,
  OTTHON_START,
  STAMP_DUTY,
  type GovProgram,
  type LoanPurpose
} from './constants';
import {
  checkEligibility,
  normalizeInput,
  type Eligibility,
  type HouseholdInput
} from './eligibility';
import { buildSchedule, type LoanEvent, type Schedule, type Tranche } from './schedule';
import { DEFAULT_SETTINGS, type OfferSetting, type PlanSettings } from './settings';
import { formatHuf, formatMillions } from './utils/currency';
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

export type PlanTimelineItem = {
  title: string;
  details: string[];
};

export type PlanTimelineEntry = {
  month: string;
  items: PlanTimelineItem[];
  monthlyAfter: number;
};

export type Plan = {
  loans: PlannedLoan[];
  grant: number;
  subsidy: number;
  // Own funds are a maximum: the planner decides how much of them to spend.
  ownFundsUsed: number;
  // Own funds left over plus unneeded free-use loan money, worth investing.
  cashKept: number;
  // What cashKept earns at the bond yield over the term, compounded yearly.
  investmentReturn: { total: number; initialMonthly: number; monthlyAverage: number };
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
  // A used home may put only part of the Falusi CSOK grant toward the price, the rest pays for modernization.
  const grant = maxAmount(GOV_PROGRAM.FALUSI_CSOK);
  const modernizationGrant =
    input.propertyCondition === 'USED'
      ? grant / FALUSI_CSOK.usedPurchaseMaxShareForPrice - grant
      : 0;
  const context: Context = {
    input,
    settings,
    eligibility,
    maxAmount,
    grant: grant + Math.min(input.renovationBudget, modernizationGrant),
    purchaseGrant: grant,
    priceNeed: Math.max(0, input.propertyPrice - grant),
    renovationNeed: Math.max(0, input.renovationBudget - modernizationGrant),
    bankOffer: cheapestOffer(settings.offers, (offer) => offer.kind !== 'OTTHON_START'),
    otthonStartOffer: cheapestOffer(settings.offers, (offer) => offer.kind === 'OTTHON_START')
  };
  const loanPrograms = LOAN_PROGRAMS.filter((program) => maxAmount(program) > 0);
  const csokPluszFloor = csokPluszForgivenessFloor(context);
  const csokPluszCaps = csokPluszFloor > 0 ? [Infinity, csokPluszFloor] : [Infinity];
  // Own funds all up front, or (when allowed) loans first with only as much own funds up front as the JTM limit needs.
  const upFront = settings.keepOwnFunds ? [input.ownFunds, 0] : [input.ownFunds];

  // Every order of every legal set, both own funds strategies, and CSOK Plusz at its max or at the
  // smallest amount that still absorbs every forgiveness (the rest then goes to cheaper loans).
  const candidates = arrangements(loanPrograms)
    .filter(isCompatible)
    .flatMap((programs) =>
      upFront.flatMap((ownFundsFirst) =>
        (programs.includes(GOV_PROGRAM.CSOK_PLUSZ) ? csokPluszCaps : [Infinity]).map(
          (csokPluszCap) => ({ programs, ownFundsFirst, csokPluszCap })
        )
      )
    );
  const [best] = candidates
    .map((candidate) =>
      candidate.ownFundsFirst === 0 ? withinJtm(context, candidate) : evaluate(context, candidate)
    )
    .toSorted(compareEvaluations);
  return (
    best ??
    evaluate(context, { programs: [], ownFundsFirst: input.ownFunds, csokPluszCap: Infinity })
  ).plan;
};

const fitsJtm = ({ plan }: Evaluation): boolean => {
  return plan.paymentToIncome <= plan.paymentToIncomeLimit;
};

// Borrows as much as the JTM limit allows: the least own funds up front that still fits it.
const withinJtm = (context: Context, candidate: Candidate): Evaluation => {
  const evaluateWith = (ownFundsFirst: number) => {
    return evaluate(context, { ...candidate, ownFundsFirst });
  };
  const loansFirst = evaluateWith(0);
  if (fitsJtm(loansFirst) || !fitsJtm(evaluateWith(context.input.ownFunds))) return loansFirst;
  let low = 0;
  let high = context.input.ownFunds;
  while (high - low > AMOUNT_SEARCH_STEP) {
    const middle = (low + high) / 2;
    if (fitsJtm(evaluateWith(middle))) high = middle;
    else low = middle;
  }
  return evaluateWith(Math.ceil(high / AMOUNT_SEARCH_STEP) * AMOUNT_SEARCH_STEP);
};

type Context = {
  input: HouseholdInput;
  settings: PlanSettings;
  eligibility: Eligibility[];
  maxAmount: (program: GovProgram) => number;
  // Grant money in use: toward the price, plus the modernization part when renovating.
  grant: number;
  purchaseGrant: number;
  priceNeed: number;
  renovationNeed: number;
  bankOffer: OfferSetting | undefined;
  otthonStartOffer: OfferSetting | undefined;
};

type PlanTranche = Tranche & { note: string; isBank: boolean; fixationYears: number };

type Candidate = {
  programs: GovProgram[];
  // Own funds spent before the subsidized loans; the rest only after them.
  ownFundsFirst: number;
  csokPluszCap: number;
};

type Evaluation = { plan: Plan; shortfall: number };

const evaluate = (context: Context, candidate: Candidate): Evaluation => {
  const { input, settings } = context;
  const { programs } = candidate;
  const loansFirst = candidate.ownFundsFirst < input.ownFunds;
  const loanToValue = input.firstHome ? MNB_LIMITS.firstBuyerLoanToValue : MNB_LIMITS.loanToValue;
  let mortgageRoom = input.propertyPrice * loanToValue;
  let ownFunds = input.ownFunds;
  let freeExtra = 0;
  const needs: Record<Exclude<LoanPurpose, 'FREE'>, number> = {
    PURCHASE: context.priceNeed,
    RENOVATION: context.renovationNeed
  };
  // Takes up to `limit` from the needs the money may pay for.
  const cover = (purposes: readonly LoanPurpose[], limit: number): number => {
    let taken = 0;
    // Renovation first: fewer sources may pay for it, so flexible money goes there.
    for (const purpose of ['RENOVATION', 'PURCHASE'] as const) {
      if (!purposes.includes(purpose)) continue;
      const amount = Math.min(needs[purpose], limit - taken);
      needs[purpose] -= amount;
      taken += amount;
    }
    return taken;
  };
  const useOwnFunds = (limit: number) => {
    ownFunds -= cover(BANK_LOAN_PURPOSES, Math.max(0, Math.min(ownFunds, limit)));
  };
  const tranches: PlanTranche[] = [];

  // Banks finance at most the LTV share of the price (Otthon Start also requires 10% önerő). The rest
  // comes from own funds and grants, and from Babaváró only when the bank accepts it.
  const ownDownPayment = settings.babavaroAsDownPayment
    ? 0
    : Math.min(
        needs.PURCHASE,
        Math.max(0, input.propertyPrice * (1 - loanToValue) - context.purchaseGrant)
      );
  const downPaid = Math.min(ownFunds, ownDownPayment);
  ownFunds -= downPaid;
  needs.PURCHASE -= downPaid;
  useOwnFunds(candidate.ownFundsFirst - downPaid);
  for (const program of programs) {
    const isMortgage = program !== GOV_PROGRAM.BABAVARO;
    const purposes = LOAN_PURPOSES[program] ?? [];
    const cap = Math.min(
      context.maxAmount(program),
      program === GOV_PROGRAM.CSOK_PLUSZ ? candidate.csokPluszCap : Infinity,
      isMortgage ? mortgageRoom : Infinity
    );
    let amount = cover(purposes, cap);
    // Free-use money beyond the need is kept and invested, but only when borrowing beats own funds.
    if (loansFirst && purposes.includes('FREE')) {
      freeExtra += cap - amount;
      amount = cap;
    }
    if (amount <= 0) continue;
    if (isMortgage) mortgageRoom -= amount;
    tranches.push(govTranche(context, program, amount));
  }
  useOwnFunds(ownFunds);

  if (mortgageRoom > 0 && context.bankOffer) {
    const amount = cover(BANK_LOAN_PURPOSES, mortgageRoom);
    if (amount > 0) tranches.push(bankTranche(context, amount, context.bankOffer));
  }
  const hasMortgage = tranches.some((tranche) => tranche.id !== GOV_PROGRAM.BABAVARO);
  const downPaymentGap = hasMortgage ? ownDownPayment - downPaid : 0;
  const uncovered = needs.PURCHASE + needs.RENOVATION;
  const remaining = uncovered + downPaymentGap;
  const cashKept = ownFunds + freeExtra;

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
      ownFundsUsed: input.ownFunds - ownFunds,
      cashKept,
      investmentReturn: investmentReturn(cashKept, settings.bondYield, input.termYears),
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
        ...(uncovered > 0
          ? [
              input.renovationBudget > 0
                ? 'A hitelek és az önerő nem fedezik a vételárat és a felújítást'
                : 'A hitelek nem fedezik a teljes vételárat, több önerő szükséges'
            ]
          : []),
        ...(paymentToIncome > paymentToIncomeLimit
          ? ['A törlesztőrészlet meghaladja a jövedelemarányos (JTM) korlátot']
          : []),
        ...(downPaymentGap > 0
          ? [
              `Legalább ${formatHuf(ownDownPayment)} saját önerő szükséges: a bank legfeljebb a vételár ${formatPercent(loanToValue)}-át finanszírozza`
            ]
          : []),
        ...(settings.babavaroAsDownPayment && tranches.some(({ id }) => id === GOV_PROGRAM.BABAVARO)
          ? ['A Babaváró önerőként való elfogadása bankfüggő']
          : []),
        ...(uncovered > 0 && !context.bankOffer
          ? ['Nincs bekapcsolt banki ajánlat a kiegészítő hitelhez']
          : [])
      ],
      tips: tips(context, tranches, schedule, cashKept)
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

// Smallest CSOK Plusz amount whose balance still absorbs every planned forgiveness, or 0 when the max is needed.
const csokPluszForgivenessFloor = (context: Context): number => {
  const max = context.maxAmount(GOV_PROGRAM.CSOK_PLUSZ);
  const rates = {
    discountRate: context.settings.bondYield,
    inflationRate: context.settings.inflationRate
  };
  const forgiven = (principal: number): number => {
    return buildSchedule([govTranche(context, GOV_PROGRAM.CSOK_PLUSZ, principal)], rates)
      .totalForgiven;
  };
  if (max <= 0) return 0;
  const full = forgiven(max);
  if (full <= 0) return 0;
  let low = 0;
  let high = max;
  while (high - low > AMOUNT_SEARCH_STEP) {
    const middle = (low + high) / 2;
    if (forgiven(middle) >= full - BALANCE_EPSILON) high = middle;
    else low = middle;
  }
  const floor = Math.max(
    CSOK_PLUSZ.minAmount,
    Math.ceil(high / AMOUNT_SEARCH_STEP) * AMOUNT_SEARCH_STEP
  );
  return floor < max ? floor : 0;
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

// Applied to the subsidized mortgage first; Babaváró is not a mortgage. A child that triggers CSOK Plusz
// forgiveness cannot also reduce another mortgage (?), and CSOK Plusz forgives every child from the 2nd.
const addMortgageForgiveness = (input: HouseholdInput, tranches: PlanTranche[]): void => {
  if (tranches.some((tranche) => tranche.id === GOV_PROGRAM.CSOK_PLUSZ)) return;
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

// One item per loan and topic, the details listed under it:
// 'Babaváró' + ['2. gyermek: 30% elengedés', '2. gyermek: szüneteltetés 3 évre']
// -> { title: 'Babaváró: 2. gyermek', details: ['30% elengedés', 'szüneteltetés 3 évre'] }.
const timeline = (input: HouseholdInput, schedule: Schedule): PlanTimelineEntry[] => {
  const events = schedule.timeline.map((entry) => {
    const [topic = '', ...rest] = entry.reason.split(': ');
    return { month: entry.month, title: `${entry.loan}: ${topic}`, detail: rest.join(': ') };
  });
  const entries = [
    { month: 0, title: 'Folyósítás, törlesztés indul', details: [] as string[] },
    ...[...Map.groupBy(events, (event) => `${event.month}|${event.title}`).values()].map(
      (group) => ({
        month: group[0]?.month ?? 0,
        title: group[0]?.title ?? '',
        details: group.map((event) => event.detail).filter(Boolean)
      })
    ),
    ...schedule.tranches.map((trancheSchedule) => ({
      month: trancheSchedule.payments.length,
      title: `${trancheSchedule.name} lejár`,
      details: []
    }))
  ].toSorted((a, b) => a.month - b.month);
  return [...Map.groupBy(entries, (entry) => entry.month)].map(([month, group]) => ({
    month: addMonths(input.startMonth, month),
    items: group.map(({ title, details }) => ({ title, details })),
    monthlyAfter: schedule.monthlyTotals[month] ?? 0
  }));
};

// Cheap loans are worth keeping: savings earn more in government bonds than prepaying saves.
const tips = (
  context: Context,
  tranches: PlanTranche[],
  schedule: Schedule,
  cashKept: number
): string[] => {
  const { settings, input } = context;
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
  const invest =
    cashKept > 0
      ? [
          `${formatHuf(cashKept)} megtartható: az olcsó hitel kevesebbe kerül, mint amennyit ez az összeg állampapírban vagy ETF-ben hoz (${bondYield}).`
        ]
      : [];
  const renovation =
    input.renovationBudget > 0
      ? [
          'Felújításra az Otthon Start és a CSOK Plusz nem használható, csak önerő, Babaváró, banki lakáshitel vagy falusi CSOK.'
        ]
      : [];
  return [...invest, ...pauses, ...keep, ...renovation];
};

const cheapestOffer = (
  offers: OfferSetting[],
  matches: (offer: OfferSetting) => boolean
): OfferSetting | undefined => {
  return offers
    .filter((offer) => offer.enabled && matches(offer))
    .toSorted((a, b) => a.annualRate - b.annualRate)[0];
};

const investmentReturn = (amount: number, annualRate: number, years: number) => {
  const total = amount * ((1 + annualRate) ** years - 1);
  return {
    total,
    initialMonthly: (amount * annualRate) / MONTHS_PER_YEAR,
    monthlyAverage: total / (years * MONTHS_PER_YEAR)
  };
};

// Kept cash is worth its face value today, so it offsets the present value of the repayments;
// stamp duty is paid in cash up front, so exempting combinations save it.
const cost = (plan: Plan): number => {
  return plan.schedule.presentValue + plan.stampDuty - plan.cashKept;
};

const compareEvaluations = (a: Evaluation, b: Evaluation): number => {
  const rank = ({ plan, shortfall }: Evaluation): number => {
    return (shortfall > 0 ? 2 : 0) + (plan.paymentToIncome > plan.paymentToIncomeLimit ? 1 : 0);
  };
  return rank(a) - rank(b) || a.shortfall - b.shortfall || cost(a.plan) - cost(b.plan);
};

const isCompatible = (programs: GovProgram[]): boolean => {
  return !INCOMPATIBLE_PROGRAMS.some(([a, b]) => programs.includes(a) && programs.includes(b));
};
