import { OFFER_KIND, type Bank, type BankOffer } from './banks/bank';
import { BANKS } from './banks';
import {
  BABAVARO,
  CSOK_PLUSZ,
  FALUSI_CSOK_LOAN,
  GOV_PROGRAM,
  INCOMPATIBLE_PROGRAMS,
  MARKET_REPRICE_RATE,
  MNB_LIMITS,
  MORTGAGE_FORGIVENESS,
  OTTHON_START,
  STAMP_DUTY,
  type GovProgram
} from './constants';
import { checkEligibility, type Eligibility, type HouseholdInput } from './eligibility';
import { addMonths, monthsBetween } from './months';
import { buildSchedule, type LoanEvent, type Schedule, type Tranche } from './schedule';

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
  stampDuty: number;
  shortfall: number;
  paymentToIncome: number;
  paymentToIncomeLimit: number;
  schedule: Schedule;
  timeline: PlanTimelineEntry[];
  eligibility: Eligibility[];
  warnings: string[];
};

export const buildPlan = (input: HouseholdInput, banks: Bank[] = BANKS): Plan => {
  const eligibility = checkEligibility(input);
  const maxAmount = (program: GovProgram): number => {
    return eligibility.find((item) => item.program === program)?.maxAmount ?? 0;
  };
  const grant = maxAmount(GOV_PROGRAM.FALUSI_CSOK);
  const need = Math.max(0, input.propertyPrice - input.ownFunds - grant);
  const bankOffer = bestBankOffer(banks);
  const candidates = LOAN_ORDER.filter((program) => maxAmount(program) > 0);

  const plans = subsets(candidates)
    .filter(isCompatible)
    .map((programs) => evaluate(input, programs, maxAmount, need, grant, bankOffer, eligibility));

  return (
    plans.toSorted(comparePlans)[0] ??
    evaluate(input, [], maxAmount, need, grant, bankOffer, eligibility)
  );
};

// Cheapest first: interest free, then subsidized with forgiveness, then subsidized, then market.
const LOAN_ORDER: GovProgram[] = [
  GOV_PROGRAM.BABAVARO,
  GOV_PROGRAM.CSOK_PLUSZ,
  GOV_PROGRAM.OTTHON_START,
  GOV_PROGRAM.FALUSI_CSOK_LOAN
];

const evaluate = (
  input: HouseholdInput,
  programs: GovProgram[],
  maxAmount: (program: GovProgram) => number,
  need: number,
  grant: number,
  bankOffer: { bank: Bank; offer: BankOffer } | undefined,
  eligibility: Eligibility[]
): Plan => {
  const mortgageCap =
    input.propertyPrice *
    (input.firstHome ? MNB_LIMITS.firstBuyerLoanToValue : MNB_LIMITS.loanToValue);
  let remaining = need;
  let mortgageRoom = mortgageCap;
  const tranches: (Tranche & { note: string })[] = [];

  for (const program of programs) {
    const isMortgage = program !== GOV_PROGRAM.BABAVARO;
    const amount = Math.min(remaining, maxAmount(program), isMortgage ? mortgageRoom : Infinity);
    if (amount <= 0) continue;
    remaining -= amount;
    if (isMortgage) mortgageRoom -= amount;
    tranches.push(govTranche(input, program, amount));
  }

  if (remaining > 0 && mortgageRoom > 0 && bankOffer) {
    const amount = Math.min(remaining, mortgageRoom);
    remaining -= amount;
    tranches.push(bankTranche(input, amount, bankOffer));
  }

  addMortgageForgiveness(input, tranches);

  const schedule = buildSchedule(tranches);
  const paymentToIncomeLimit = jtmLimit(input, tranches, bankOffer?.offer);
  const paymentToIncome =
    input.netIncome > 0 ? schedule.initialMonthly / input.netIncome : Infinity;
  const warnings = [
    ...(remaining > 0 ? ['A hitelek nem fedezik a teljes vételárat, több önerő szükséges'] : []),
    ...(paymentToIncome > paymentToIncomeLimit
      ? ['A törlesztőrészlet meghaladja a jövedelemarányos (JTM) korlátot']
      : []),
    ...(programs.includes(GOV_PROGRAM.BABAVARO)
      ? ['A Babaváró önerőként való elfogadása bankfüggő']
      : [])
  ];

  return {
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
    grant,
    stampDuty: stampDuty(input, grant > 0 ? [...programs, GOV_PROGRAM.FALUSI_CSOK] : programs),
    shortfall: remaining,
    paymentToIncome,
    paymentToIncomeLimit,
    schedule,
    timeline: timeline(input, tranches, schedule),
    eligibility,
    warnings
  };
};

const govTranche = (
  input: HouseholdInput,
  program: GovProgram,
  amount: number
): Tranche & { note: string } => {
  const births = birthsAfterStart(input);
  const desiredMonths = input.termYears * 12;

  if (program === GOV_PROGRAM.BABAVARO) {
    const events = births.slice(0, 3).flatMap(({ month }, index): LoanEvent[] => {
      const order = index + 1;
      const share = BABAVARO.forgivenessRateByChild[order as 2 | 3];
      const forgive: LoanEvent[] = share
        ? [
            {
              month,
              type: 'forgiveShare',
              share,
              reason: `${order}. gyermek: ${share * 100}% elengedés`
            }
          ]
        : [];
      const suspend: LoanEvent[] =
        (BABAVARO.suspendingChildren as readonly number[]).includes(order) && share !== 1
          ? [
              {
                month,
                type: 'suspend',
                months: BABAVARO.suspensionMonthsPerChild,
                reason: `${order}. gyermek: szüneteltetés 3 évre`
              }
            ]
          : [];
      return [...forgive, ...suspend];
    });
    const minMonths = Math.ceil(amount / BABAVARO.maxMonthlyPayment);
    return {
      id: program,
      name: BABAVARO.name,
      principal: amount,
      annualRate: BABAVARO.annualRate,
      termMonths: clamp(minMonths, BABAVARO.minTermYears * 12, BABAVARO.maxTermYears * 12),
      events,
      note: 'Kamatmentes, gyermekenként szünetel, 2. gyermeknél 30%, 3.-nál teljes elengedés'
    };
  }

  if (program === GOV_PROGRAM.CSOK_PLUSZ) {
    const existing = input.childrenBirthMonths.length;
    const events = births.flatMap(({ month }, index): LoanEvent[] => {
      const order = existing + index + 1;
      if (order >= CSOK_PLUSZ.forgivenessFromChildOrder) {
        return [
          {
            month,
            type: 'forgive',
            amount: CSOK_PLUSZ.forgivenessPerChild,
            reason: `${order}. gyermek: 10 millió Ft elengedés`
          }
        ];
      }
      return [
        {
          month,
          type: 'suspend',
          months: CSOK_PLUSZ.firstChildSuspensionMonths,
          reason: '1. gyermek: 12 hónap szüneteltetés'
        }
      ];
    });
    return {
      id: program,
      name: CSOK_PLUSZ.name,
      principal: amount,
      annualRate: CSOK_PLUSZ.annualRate,
      termMonths: clamp(desiredMonths, CSOK_PLUSZ.minTermYears * 12, CSOK_PLUSZ.maxTermYears * 12),
      events,
      note: 'Fix 3%, 2. gyermektől gyermekenként 10 millió Ft elengedés'
    };
  }

  const config = program === GOV_PROGRAM.OTTHON_START ? OTTHON_START : FALUSI_CSOK_LOAN;
  return {
    id: program,
    name: config.name,
    principal: amount,
    annualRate: config.annualRate,
    termMonths: Math.min(desiredMonths, config.maxTermYears * 12),
    events: [],
    note: 'Fix 3% a teljes futamidőre'
  };
};

const bankTranche = (
  input: HouseholdInput,
  amount: number,
  { bank, offer }: { bank: Bank; offer: BankOffer }
): Tranche & { note: string } => {
  const termMonths = input.termYears * 12;
  const fixationMonths = offer.fixationYears === 'term' ? termMonths : offer.fixationYears * 12;
  const events: LoanEvent[] =
    fixationMonths < termMonths
      ? [
          {
            month: fixationMonths,
            type: 'reprice',
            annualRate: MARKET_REPRICE_RATE,
            reason: 'Kamatperiódus vége, átárazás piaci átlagra'
          }
        ]
      : [];
  return {
    id: `bank-${bank.id}`,
    name: `${bank.name} ${offer.product}`,
    principal: amount,
    annualRate: offer.annualRate,
    termMonths,
    events,
    note:
      offer.fixationYears === 'term'
        ? 'Végig fix kamat'
        : `${offer.fixationYears} év kamatfixálás, utána piaci kamat (becslés)`
  };
};

// Applied to the subsidized mortgage first; CSOK Plusz already forgives per child, Babaváró is not a mortgage.
const addMortgageForgiveness = (input: HouseholdInput, tranches: Tranche[]): void => {
  const target =
    tranches.find((tranche) => tranche.id === GOV_PROGRAM.OTTHON_START) ??
    tranches.find((tranche) => tranche.id.startsWith('bank-')) ??
    tranches.find((tranche) => tranche.id === GOV_PROGRAM.FALUSI_CSOK_LOAN);
  if (!target) return;
  const existing = input.childrenBirthMonths.length;
  birthsAfterStart(input).forEach(({ month }, index) => {
    const order = existing + index + 1;
    if (order < 2) return;
    const amount =
      MORTGAGE_FORGIVENESS.amountByChildOrder[order as 2 | 3] ??
      MORTGAGE_FORGIVENESS.amountForFurtherChild;
    target.events.push({
      month,
      type: 'forgive',
      amount,
      reason: `${order}. gyermek: jelzáloghitel-elengedés (${amount / 1_000_000} millió Ft)`
    });
  });
};

const birthsAfterStart = (input: HouseholdInput): { month: number }[] => {
  return input.plannedChildrenMonths
    .filter(Boolean)
    .map((month) => ({ month: monthsBetween(input.startMonth, month) }))
    .filter(({ month }) => month >= 0)
    .toSorted((a, b) => a.month - b.month);
};

const jtmLimit = (input: HouseholdInput, tranches: Tranche[], offer?: BankOffer): number => {
  const column = input.netIncome >= MNB_LIMITS.incomeThreshold ? 1 : 0;
  const hasBank = tranches.some((tranche) => tranche.id.startsWith('bank-'));
  const fixation =
    hasBank && offer && offer.fixationYears !== 'term' ? offer.fixationYears : Infinity;
  const row =
    fixation < 5 ? 'UNDER_5_YEARS' : fixation < 10 ? 'FROM_5_TO_10_YEARS' : 'FROM_10_YEARS';
  return MNB_LIMITS.paymentToIncomeByFixation[row][column];
};

const stampDuty = (input: HouseholdInput, programs: GovProgram[]): number => {
  if (
    programs.some((program) => (STAMP_DUTY.exemptWith as readonly GovProgram[]).includes(program))
  ) {
    return 0;
  }
  if (
    input.propertyCondition === 'NEW' &&
    input.propertyPrice <= STAMP_DUTY.newHomeExemptionMaxValue
  ) {
    return Math.max(0, input.propertyPrice - STAMP_DUTY.newHomeExemptUpTo) * STAMP_DUTY.rate;
  }
  return input.propertyPrice * STAMP_DUTY.rate;
};

const timeline = (
  input: HouseholdInput,
  tranches: Tranche[],
  schedule: Schedule
): PlanTimelineEntry[] => {
  const monthlyAt = (month: number): number => schedule.monthlyTotals[month] ?? 0;
  const ends = schedule.tranches.map((trancheSchedule, index) => ({
    month: trancheSchedule.payments.length,
    reason: `${tranches[index]?.name ?? ''} lejár`
  }));
  const entries = [
    { month: 0, reason: 'Folyósítás, törlesztés indul' },
    ...schedule.timeline,
    ...ends
  ].toSorted((a, b) => a.month - b.month);
  const byMonth = Map.groupBy(entries, (entry) => entry.month);
  return [...byMonth].map(([month, group]) => ({
    month: addMonths(input.startMonth, month),
    titles: group.map((entry) => entry.reason),
    monthlyAfter: monthlyAt(month)
  }));
};

const bestBankOffer = (banks: Bank[]): { bank: Bank; offer: BankOffer } | undefined => {
  const offers = banks.flatMap((bank) =>
    bank.offers
      .filter((offer) => offer.kind !== OFFER_KIND.OTTHON_START)
      .map((offer) => ({ bank, offer }))
  );
  return offers.toSorted((a, b) => a.offer.annualRate - b.offer.annualRate)[0];
};

const comparePlans = (a: Plan, b: Plan): number => {
  const rank = (plan: Plan): number => {
    return (
      (plan.shortfall > 0 ? 2 : 0) + (plan.paymentToIncome > plan.paymentToIncomeLimit ? 1 : 0)
    );
  };
  return (
    rank(a) - rank(b) || a.shortfall - b.shortfall || a.schedule.totalPaid - b.schedule.totalPaid
  );
};

const isCompatible = (programs: GovProgram[]): boolean => {
  return !INCOMPATIBLE_PROGRAMS.some(([a, b]) => programs.includes(a) && programs.includes(b));
};

const subsets = <T>(items: T[]): T[][] => {
  return items.reduce<T[][]>(
    (all, item) => [...all, ...all.map((subset) => [...subset, item])],
    [[]]
  );
};

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(max, Math.max(min, value));
};
