import { describe, expect, it } from 'vite-plus/test';
import { buildSchedule, type Tranche } from './schedule';

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

describe('buildSchedule', () => {
  it('repays principal plus interest over the term', () => {
    const schedule = buildSchedule([tranche({})], RATES);

    expect(schedule.monthlyTotals).toHaveLength(300);
    expect(schedule.totalPaid).toBeCloseTo(237_105.657 * 300, -1);
    expect(Math.round(schedule.averageMonthly)).toBe(237_106);
  });

  it('pays nothing during suspension and extends the term', () => {
    const schedule = buildSchedule(
      [
        tranche({
          annualRate: 0,
          principal: 1_200_000,
          termMonths: 12,
          events: [{ month: 2, type: 'suspend', months: 3, optional: false, reason: 'child' }]
        })
      ],
      RATES
    );

    expect(schedule.monthlyTotals).toHaveLength(15);
    expect(schedule.monthlyTotals.slice(2, 5)).toEqual([0, 0, 0]);
    expect(schedule.totalPaid).toBeCloseTo(1_200_000);
  });

  it('lowers installments after partial forgiveness', () => {
    const schedule = buildSchedule(
      [
        tranche({
          annualRate: 0,
          principal: 1_200_000,
          termMonths: 12,
          events: [{ month: 6, type: 'forgive', amount: 300_000, reason: 'child' }]
        })
      ],
      RATES
    );

    expect(schedule.monthlyTotals[5]).toBe(100_000);
    expect(schedule.monthlyTotals[6]).toBe(50_000);
    expect(schedule.totalForgiven).toBe(300_000);
    expect(schedule.totalPaid).toBeCloseTo(900_000);
  });

  it('forgives a share of the remaining balance', () => {
    const schedule = buildSchedule(
      [
        tranche({
          annualRate: 0,
          principal: 1_200_000,
          termMonths: 12,
          events: [{ month: 6, type: 'forgiveShare', share: 0.5, reason: 'second child' }]
        })
      ],
      RATES
    );

    expect(schedule.totalForgiven).toBe(300_000);
    expect(schedule.monthlyTotals[6]).toBe(50_000);
  });

  it('ends the loan when forgiveness covers the balance', () => {
    const schedule = buildSchedule(
      [
        tranche({
          annualRate: 0,
          principal: 1_200_000,
          termMonths: 12,
          events: [{ month: 3, type: 'forgive', amount: 5_000_000, reason: 'third child' }]
        })
      ],
      RATES
    );

    expect(schedule.monthlyTotals).toHaveLength(3);
    expect(schedule.totalForgiven).toBe(900_000);
  });

  it('recalculates the installment on repricing', () => {
    const schedule = buildSchedule(
      [
        tranche({
          principal: 10_000_000,
          annualRate: 0.06,
          termMonths: 240,
          events: [{ month: 120, type: 'reprice', annualRate: 0.08, reason: 'fixation ends' }]
        })
      ],
      RATES
    );

    expect(schedule.monthlyTotals[121]).toBeGreaterThan(schedule.monthlyTotals[119] ?? 0);
    expect(schedule.monthlyTotals).toHaveLength(240);
  });

  it('sums parallel tranches and orders the timeline', () => {
    const schedule = buildSchedule(
      [
        tranche({
          id: 'a',
          events: [{ month: 50, type: 'reprice', annualRate: 0.03, reason: 'b' }]
        }),
        tranche({
          id: 'b',
          events: [{ month: 10, type: 'suspend', months: 1, optional: false, reason: 'a' }]
        })
      ],
      RATES
    );

    expect(schedule.initialMonthly).toBeCloseTo(2 * 237_105.66, 0);
    expect(schedule.timeline.map((entry) => entry.month)).toEqual([10, 50]);
  });

  it('splits evenly without interest', () => {
    const schedule = buildSchedule(
      [tranche({ principal: 1_200_000, annualRate: 0, termMonths: 12 })],
      RATES
    );

    expect(schedule.initialMonthly).toBe(100_000);
  });

  it('accrues interest during a pause', () => {
    const paused = buildSchedule(
      [
        tranche({
          principal: 1_200_000,
          annualRate: 0.12,
          termMonths: 12,
          events: [{ month: 0, type: 'suspend', months: 12, optional: false, reason: 'child' }]
        })
      ],
      RATES
    );

    expect(paused.monthlyTotals[12]).toBeGreaterThan((1_200_000 * 1.12) / 12);
  });

  it('takes an optional pause when the loan is cheaper than the discount rate', () => {
    const schedule = buildSchedule(
      [
        tranche({
          annualRate: 0,
          events: [{ month: 12, type: 'suspend', months: 36, optional: true, reason: 'child' }]
        })
      ],
      RATES
    );

    expect(schedule.timeline).toHaveLength(1);
    expect(schedule.monthlyTotals[12]).toBe(0);
  });

  it('skips an optional pause when the loan costs more than the discount rate', () => {
    const schedule = buildSchedule(
      [
        tranche({
          annualRate: 0.08,
          events: [{ month: 12, type: 'suspend', months: 36, optional: true, reason: 'child' }]
        })
      ],
      RATES
    );

    expect(schedule.timeline).toEqual([]);
    expect(schedule.monthlyTotals[12]).toBeGreaterThan(0);
  });

  it('values future payments below their nominal sum under inflation', () => {
    const schedule = buildSchedule([tranche({})], RATES);

    expect(schedule.realTotalPaid).toBeLessThan(schedule.totalPaid);
  });

  it('returns zeros without tranches', () => {
    const schedule = buildSchedule([], RATES);

    expect(schedule.totalPaid).toBe(0);
    expect(schedule.averageMonthly).toBe(0);
  });
});
