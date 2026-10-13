import { describe, expect, it } from 'vite-plus/test';
import { buildSchedule, type LoanEvent, type Tranche } from './schedule';

const RATES = { discountRate: 0.05, inflationRate: 0.025 };

const tranche = (overrides: Partial<Tranche>): Tranche => {
  return {
    id: 'loan',
    name: 'Loan',
    principal: 50_000_000,
    annualRate: 0.03,
    termMonths: 300,
    events: [],
    ...overrides
  };
};

const flat = (events: LoanEvent[], annualRate = 0): Tranche => {
  return tranche({ principal: 1_200_000, annualRate, termMonths: 12, events });
};

const schedule = (...tranches: Tranche[]) => {
  return buildSchedule(tranches, RATES);
};

const suspend = (month: number, months: number): LoanEvent => {
  return { month, type: 'suspend', months, optional: false, reason: '' };
};

describe('buildSchedule', () => {
  it('pays once per month over the term', () => {
    expect(schedule(tranche({})).monthlyTotals).toHaveLength(300);
  });

  it('matches the known Otthon Start installment (50M, 3%, 25y)', () => {
    expect(Math.round(schedule(tranche({})).initialMonthly)).toBe(237_106);
  });

  it('matches the known annuity of a market loan (20M, 6%, 25y)', () => {
    const result = schedule(tranche({ principal: 20_000_000, annualRate: 0.06 }));

    expect(result.initialMonthly).toBeCloseTo(128_860.28, 1);
  });

  it('repays principal plus interest in total', () => {
    expect(schedule(tranche({})).totalPaid).toBeCloseTo(237_105.657 * 300, -1);
  });

  it('splits evenly without interest', () => {
    expect(schedule(flat([])).initialMonthly).toBe(100_000);
  });

  it('pays nothing during a suspension', () => {
    const result = schedule(flat([suspend(2, 3)]));

    expect(result.monthlyTotals.slice(2, 5)).toEqual([0, 0, 0]);
  });

  it('extends the term by the suspension', () => {
    expect(schedule(flat([suspend(2, 3)])).monthlyTotals).toHaveLength(15);
  });

  it('accrues interest during a pause and repays it afterwards', () => {
    const result = schedule(flat([suspend(0, 12)], 0.12));

    expect(result.monthlyTotals[12]).toBeCloseTo(120_140.45, 1);
  });

  it('lowers installments after partial forgiveness', () => {
    const result = schedule(flat([{ month: 6, type: 'forgive', amount: 300_000, reason: '' }]));

    expect(result.monthlyTotals[6]).toBe(50_000);
  });

  it('reports the forgiven amount', () => {
    const result = schedule(flat([{ month: 6, type: 'forgive', amount: 300_000, reason: '' }]));

    expect(result.totalForgiven).toBe(300_000);
  });

  it('forgives a share of the remaining balance', () => {
    const result = schedule(flat([{ month: 6, type: 'forgiveShare', share: 0.5, reason: '' }]));

    expect(result.totalForgiven).toBe(300_000);
  });

  it('ends the loan when forgiveness covers the balance', () => {
    const result = schedule(flat([{ month: 3, type: 'forgive', amount: 5_000_000, reason: '' }]));

    expect(result.monthlyTotals).toHaveLength(3);
  });

  it('ends the loan at a full forgiveness during a pause', () => {
    const result = schedule(
      flat([suspend(2, 3), { month: 3, type: 'forgiveShare', share: 1, reason: '' }])
    );

    expect(result.monthlyTotals).toHaveLength(3);
  });

  it('does not restart a pause on a loan forgiven in full meanwhile', () => {
    const result = schedule(
      flat([suspend(2, 3), { month: 3, type: 'forgiveShare', share: 1, reason: '' }])
    );

    expect(result.timeline.map((entry) => entry.month)).toEqual([2, 3]);
  });

  it('recomputes the installment at the new rate when repriced', () => {
    const result = schedule(
      tranche({
        principal: 10_000_000,
        annualRate: 0.06,
        termMonths: 240,
        events: [{ month: 120, type: 'reprice', annualRate: 0.08, reason: '' }]
      })
    );

    expect(
      [result.monthlyTotals[119], result.monthlyTotals[120]].map((value) => Math.round(value ?? 0))
    ).toEqual([71_643, 78_294]);
  });

  it('sums parallel tranches', () => {
    expect(schedule(tranche({}), tranche({})).initialMonthly).toBeCloseTo(2 * 237_105.66, 0);
  });

  it('orders the timeline by month', () => {
    const result = schedule(
      tranche({ events: [{ month: 50, type: 'reprice', annualRate: 0.03, reason: '' }] }),
      tranche({ events: [suspend(10, 1)] })
    );

    expect(result.timeline.map((entry) => entry.month)).toEqual([10, 11, 50]);
  });

  it('marks when a pause ends', () => {
    expect(schedule(flat([suspend(2, 3)])).timeline.map((entry) => entry.month)).toEqual([2, 5]);
  });

  it('marks only the last end of overlapping pauses', () => {
    const result = schedule(flat([suspend(2, 3), suspend(4, 3)]));

    expect(result.timeline.map((entry) => entry.month)).toEqual([2, 4, 7]);
  });

  it('takes an optional pause when the loan is cheaper than the discount rate', () => {
    const result = schedule(
      tranche({
        annualRate: 0,
        events: [{ month: 12, type: 'suspend', months: 36, optional: true, reason: '' }]
      })
    );

    expect(result.monthlyTotals[12]).toBe(0);
  });

  it('skips an optional pause when the loan costs more than the discount rate', () => {
    const result = schedule(
      tranche({
        annualRate: 0.08,
        events: [{ month: 12, type: 'suspend', months: 36, optional: true, reason: '' }]
      })
    );

    expect(result.timeline).toEqual([]);
  });

  it('discounts payments by inflation in the real total', () => {
    expect(schedule(flat([])).realTotalPaid).toBeCloseTo(1_184_086.53, 0);
  });

  it('pays nothing before a deferred loan starts', () => {
    const result = schedule(
      tranche({ principal: 1_200_000, annualRate: 0, termMonths: 12, startMonth: 6 })
    );

    expect(result.monthlyTotals.slice(0, 7)).toEqual([0, 0, 0, 0, 0, 0, 100_000]);
  });

  it('lowers the balance on a prepayment without counting it as forgiven', () => {
    const result = schedule(flat([{ month: 6, type: 'prepay', amount: 300_000, reason: '' }]));

    expect([
      result.monthlyTotals[6],
      result.totalForgiven,
      result.tranches[0]?.totalPrepaid
    ]).toEqual([50_000, 0, 300_000]);
  });

  it('adds a one-off charge to that month without changing the balance', () => {
    const result = schedule(flat([{ month: 3, type: 'charge', amount: 50_000, reason: '' }]));

    expect(result.monthlyTotals.slice(2, 5)).toEqual([100_000, 150_000, 100_000]);
  });

  it('charges nothing during a pause that does not accrue', () => {
    const pause: LoanEvent = {
      month: 0,
      type: 'suspend',
      months: 12,
      optional: false,
      accrues: false,
      reason: ''
    };

    expect(schedule(flat([pause], 0.12)).monthlyTotals[12]).toBeCloseTo(106_618.55, 1);
  });

  it('pays only interest during the interest only months', () => {
    const result = schedule(
      tranche({ principal: 12_000_000, annualRate: 0.03, termMonths: 120, interestOnlyMonths: 12 })
    );

    expect(result.monthlyTotals[0]).toBe(30_000);
    expect(result.monthlyTotals[12]).toBeCloseTo(126_923.28, 1);
  });

  it('returns zeros without tranches', () => {
    expect(schedule().totalPaid).toBe(0);
  });
});
