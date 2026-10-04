import { subsets } from './utils';
export type LoanEvent =
  | { month: number; type: 'suspend'; months: number; optional: boolean; reason: string }
  | { month: number; type: 'forgive'; amount: number; reason: string }
  | { month: number; type: 'forgiveShare'; share: number; reason: string }
  | { month: number; type: 'reprice'; annualRate: number; reason: string };

export type Tranche = {
  id: string;
  name: string;
  principal: number;
  annualRate: number;
  termMonths: number;
  events: LoanEvent[];
};

type TimelineEntry = {
  month: number;
  loan: string;
  reason: string;
  optional: boolean;
};

type TrancheSchedule = {
  id: string;
  payments: number[];
  totalPaid: number;
  totalForgiven: number;
  initialPayment: number;
};

export type Schedule = {
  tranches: TrancheSchedule[];
  monthlyTotals: number[];
  totalPaid: number;
  totalForgiven: number;
  initialMonthly: number;
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

const annuity = (principal: number, annualRate: number, months: number): number => {
  if (months <= 0) return principal;
  if (annualRate === 0) return principal / months;
  const rate = annualRate / 12;
  return (principal * rate) / (1 - (1 + rate) ** -months);
};

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
    .flatMap((tranche) =>
      tranche.events.map((event) => ({
        month: event.month,
        loan: tranche.name,
        reason: event.reason,
        optional: event.type === 'suspend' && event.optional
      }))
    )
    .toSorted((a, b) => a.month - b.month);

  return {
    tranches: schedules,
    monthlyTotals,
    totalPaid,
    totalForgiven: sum(schedules.map((schedule) => schedule.totalForgiven)),
    initialMonthly: monthlyTotals[0] ?? 0,
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
    (total, payment, month) => total + payment / (1 + annualRate) ** ((month + 1) / 12),
    0
  );
};

// Suspension pauses payments and extends the term by the same length; interest keeps accruing.
const simulateTranche = (tranche: Tranche): TrancheSchedule => {
  const payments: number[] = [];
  let balance = tranche.principal;
  let rate = tranche.annualRate;
  let remaining = tranche.termMonths;
  let payment = annuity(balance, rate, remaining);
  let suspendedUntil = -1;
  let totalForgiven = 0;

  for (let month = 0; balance > BALANCE_EPSILON && remaining > 0; month++) {
    const events = tranche.events.filter((event) => event.month === month);
    for (const event of events) {
      if (event.type === 'suspend') suspendedUntil = month + event.months;
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
    }
    if (events.length > 0 || month === suspendedUntil) payment = annuity(balance, rate, remaining);

    if (month < suspendedUntil) {
      balance += (balance * rate) / 12;
      payments.push(0);
      continue;
    }
    if (balance <= BALANCE_EPSILON) break;

    const interest = (balance * rate) / 12;
    const due = Math.min(payment, balance + interest);
    balance = balance + interest - due;
    remaining--;
    payments.push(due);
  }

  return {
    id: tranche.id,
    payments,
    totalPaid: sum(payments),
    totalForgiven,
    initialPayment: payments[0] ?? 0
  };
};

const BALANCE_EPSILON = 0.5;

const sum = (values: number[]): number => {
  return values.reduce((total, value) => total + value, 0);
};
