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

describe('buildSchedule', () => {
  it('pays once per month over the term', () => {
    expect(schedule(tranche({})).monthlyTotals).toHaveLength(300);
  });

  it('matches the known Otthon Start installment (50M, 3%, 25y)', () => {
    expect(Math.round(schedule(tranche({})).initialMonthly)).toBe(237_106);
  });

  it('repays principal plus interest in total', () => {
    expect(schedule(tranche({})).totalPaid).toBeCloseTo(237_105.657 * 300, -1);
  });

  it('splits evenly without interest', () => {
    expect(schedule(flat([])).initialMonthly).toBe(100_000);
  });

  it('pays nothing during a suspension', () => {
    const result = schedule(
      flat([{ month: 2, type: 'suspend', months: 3, optional: false, reason: '' }])
    );

    expect(result.monthlyTotals.slice(2, 5)).toEqual([0, 0, 0]);
  });

  it('extends the term by the suspension', () => {
    const result = schedule(
      flat([{ month: 2, type: 'suspend', months: 3, optional: false, reason: '' }])
    );

    expect(result.monthlyTotals).toHaveLength(15);
  });

  it('accrues interest during a pause and repays it afterwards', () => {
    const result = schedule(
      flat([{ month: 0, type: 'suspend', months: 12, optional: false, reason: '' }], 0.12)
    );

    expect(result.monthlyTotals[12]).toBeGreaterThan((1_200_000 * 1.12) / 12);
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

  it('raises the installment when repriced higher', () => {
    const result = schedule(
      tranche({
        principal: 10_000_000,
        annualRate: 0.06,
        termMonths: 240,
        events: [{ month: 120, type: 'reprice', annualRate: 0.08, reason: '' }]
      })
    );

    expect(result.monthlyTotals[121]).toBeGreaterThan(result.monthlyTotals[119] ?? 0);
  });

  it('sums parallel tranches', () => {
    expect(schedule(tranche({}), tranche({})).initialMonthly).toBeCloseTo(2 * 237_105.66, 0);
  });

  it('orders the timeline by month', () => {
    const result = schedule(
      tranche({ events: [{ month: 50, type: 'reprice', annualRate: 0.03, reason: '' }] }),
      tranche({ events: [{ month: 10, type: 'suspend', months: 1, optional: false, reason: '' }] })
    );

    expect(result.timeline.map((entry) => entry.month)).toEqual([10, 50]);
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

  it('values future payments below their nominal sum under inflation', () => {
    const result = schedule(tranche({}));

    expect(result.realTotalPaid).toBeLessThan(result.totalPaid);
  });

  it('returns zeros without tranches', () => {
    expect(schedule().totalPaid).toBe(0);
  });
});
