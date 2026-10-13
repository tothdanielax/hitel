import { BALANCE_EPSILON, MONTHS_PER_YEAR } from './constants';
import { subsets, sum } from './utils/math';
export type LoanEvent =
  // `accrues: false` when nothing is charged during the pause (Babaváró's guarantee fee).
  | {
      month: number;
      type: 'suspend';
      months: number;
      optional: boolean;
      accrues?: boolean;
      reason: string;
    }
  | { month: number; type: 'forgive'; amount: number; reason: string }
  | { month: number; type: 'forgiveShare'; share: number; reason: string }
  | { month: number; type: 'reprice'; annualRate: number; reason: string }
  // Paid down from other money (e.g. a later Babaváró): lowers the balance, is neither paid nor forgiven here.
  | { month: number; type: 'prepay'; amount: number; reason: string }
  // A one-off payment on top of the installment (e.g. a subsidy paid back), the balance is unchanged.
  | { month: number; type: 'charge'; amount: number; reason: string };

export type Tranche = {
  id: string;
  name: string;
  principal: number;
  annualRate: number;
  termMonths: number;
  // Months after the plan start when the loan is disbursed (0 = at the start).
  startMonth?: number;
  // Interest only at first, the principal is repaid over the rest of the term.
  interestOnlyMonths?: number;
  events: LoanEvent[];
};

type TimelineEntry = {
  month: number;
  loan: string;
  reason: string;
  optional: boolean;
};

type TrancheSchedule = {
  name: string;
  payments: number[];
  totalPaid: number;
  totalForgiven: number;
  totalPrepaid: number;
  initialPayment: number;
  // The full installment without grace or pauses, what lenders test against income.
  regularPayment: number;
};

export type Schedule = {
  tranches: TrancheSchedule[];
  monthlyTotals: number[];
  totalPaid: number;
  totalForgiven: number;
  initialMonthly: number;
  regularMonthly: number;
  averageMonthly: number;
  presentValue: number;
  realTotalPaid: number;
  timeline: TimelineEntry[];
};

type Rates = {
  // Opportunity cost of money: what savings earn instead of repaying (e.g. government bonds).
  discountRate: number;
  inflationRate: number;
};

const PAUSE_END_REASON = 'szüneteltetés vége, a törlesztés újraindul';

export const buildSchedule = (tranches: Tranche[], rates: Rates): Schedule => {
  const chosen = tranches.map((tranche) =>
    withWorthwhileOptionalEvents(tranche, rates.discountRate)
  );
  const schedules = chosen.map(simulateTranche);
  const length = Math.max(0, ...schedules.map((schedule) => schedule.payments.length));
  const monthlyTotals = Array.from({ length }, (_, month) =>
    schedules.reduce((sum, schedule) => sum + (schedule.payments[month] ?? 0), 0)
  );
  const totalPaid = sum(monthlyTotals);
  const timeline = chosen
    .flatMap((tranche, index) =>
      tranche.events.flatMap((event) => {
        const entry = {
          month: event.month,
          loan: tranche.name,
          reason: event.reason,
          optional: event.type === 'suspend' && event.optional
        };
        if (event.type !== 'suspend') return [entry];
        const resumeMonth = event.month + event.months;
        // A pause started before this one ends takes over the end date.
        const extended = tranche.events.some(
          (other) =>
            other.type === 'suspend' && other.month > event.month && other.month <= resumeMonth
        );
        // No restart for a pause that outlasts the loan (forgiven in full meanwhile).
        const endsFirst = (schedules[index]?.payments.length ?? 0) <= resumeMonth;
        if (extended || endsFirst) return [entry];
        const resume = {
          month: resumeMonth,
          loan: tranche.name,
          reason: PAUSE_END_REASON,
          optional: false
        };
        return [entry, resume];
      })
    )
    .toSorted((a, b) => a.month - b.month);

  return {
    tranches: schedules,
    monthlyTotals,
    totalPaid,
    totalForgiven: sum(schedules.map((schedule) => schedule.totalForgiven)),
    initialMonthly: monthlyTotals[0] ?? 0,
    regularMonthly: sum(schedules.map((schedule) => schedule.regularPayment)),
    averageMonthly: length === 0 ? 0 : totalPaid / length,
    presentValue: presentValue(monthlyTotals, rates.discountRate),
    realTotalPaid: presentValue(monthlyTotals, rates.inflationRate),
    timeline
  };
};

// An optional pause is only worth taking when deferring payments lowers their present value,
// i.e. the loan is cheaper than what the saved installments earn meanwhile.
const withWorthwhileOptionalEvents = (tranche: Tranche, discountRate: number): Tranche => {
  const optional = tranche.events.filter((event) => event.type === 'suspend' && event.optional);
  const required = tranche.events.filter((event) => !optional.includes(event));
  const candidates = subsets(optional).map((picked) => ({
    ...tranche,
    events: [...required, ...picked].toSorted((a, b) => a.month - b.month)
  }));
  const cost = (candidate: Tranche): number => {
    return presentValue(simulateTranche(candidate).payments, discountRate);
  };
  return candidates.reduce((best, candidate) => (cost(candidate) < cost(best) ? candidate : best));
};

const presentValue = (payments: number[], annualRate: number): number => {
  return payments.reduce(
    (total, payment, month) =>
      total + payment / (1 + annualRate) ** ((month + 1) / MONTHS_PER_YEAR),
    0
  );
};

// Suspension pauses payments and extends the term by the same length; interest keeps accruing.
const simulateTranche = (tranche: Tranche): TrancheSchedule => {
  const start = tranche.startMonth ?? 0;
  const payments: number[] = Array.from({ length: start }, () => 0);
  let balance = tranche.principal;
  let rate = tranche.annualRate;
  let remaining = tranche.termMonths;
  let payment = annuity(balance, rate, remaining);
  const interestOnlyUntil = start + (tranche.interestOnlyMonths ?? 0);
  let suspendedUntil = -1;
  let accrues = true;
  let totalForgiven = 0;
  let totalPrepaid = 0;
  let charged = 0;

  for (let month = start; balance > BALANCE_EPSILON && remaining > 0; month++) {
    const events = tranche.events.filter((event) => event.month === month);
    for (const event of events) {
      if (event.type === 'suspend') {
        suspendedUntil = month + event.months;
        accrues = event.accrues ?? true;
      }
      if (event.type === 'forgive') {
        const forgiven = Math.min(balance, event.amount);
        balance -= forgiven;
        totalForgiven += forgiven;
      }
      if (event.type === 'forgiveShare') {
        totalForgiven += balance * event.share;
        balance -= balance * event.share;
      }
      if (event.type === 'reprice') rate = event.annualRate;
      if (event.type === 'charge') charged += event.amount;
      if (event.type === 'prepay') {
        const prepaid = Math.min(balance, event.amount);
        balance -= prepaid;
        totalPrepaid += prepaid;
      }
    }
    // Forgiven in full (e.g. Babaváró at the 3rd child): the loan ends now, even during a pause.
    if (balance <= BALANCE_EPSILON) break;
    if (events.length > 0 || month === suspendedUntil || month === interestOnlyUntil) {
      payment = annuity(balance, rate, remaining);
    }

    if (month < suspendedUntil) {
      if (accrues) balance += (balance * rate) / MONTHS_PER_YEAR;
      payments.push(charged);
      charged = 0;
      continue;
    }

    const interest = (balance * rate) / MONTHS_PER_YEAR;
    const due = month < interestOnlyUntil ? interest : Math.min(payment, balance + interest);
    balance = balance + interest - due;
    remaining--;
    payments.push(due + charged);
    charged = 0;
  }

  return {
    name: tranche.name,
    payments,
    totalPaid: sum(payments),
    totalForgiven,
    totalPrepaid,
    initialPayment: payments[start] ?? 0,
    regularPayment: annuity(tranche.principal, tranche.annualRate, tranche.termMonths)
  };
};

const annuity = (principal: number, annualRate: number, months: number): number => {
  if (months <= 0) return principal;
  if (annualRate === 0) return principal / months;
  const rate = annualRate / MONTHS_PER_YEAR;
  return (principal * rate) / (1 - (1 + rate) ** -months);
};
