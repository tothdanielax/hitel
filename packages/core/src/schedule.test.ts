import { describe, expect, it } from 'vite-plus/test';
import { buildSchedule, type Tranche } from './schedule';

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
    const schedule = buildSchedule([tranche({})]);

    expect(schedule.monthlyTotals).toHaveLength(300);
    expect(schedule.totalPaid).toBeCloseTo(237_105.657 * 300, -1);
    expect(Math.round(schedule.averageMonthly)).toBe(237_106);
  });

  it('pays nothing during suspension and extends the term', () => {
    const schedule = buildSchedule([
      tranche({
        annualRate: 0,
        principal: 1_200_000,
        termMonths: 12,
        events: [{ month: 2, type: 'suspend', months: 3, reason: 'child' }]
      })
    ]);

    expect(schedule.monthlyTotals).toHaveLength(15);
    expect(schedule.monthlyTotals.slice(2, 5)).toEqual([0, 0, 0]);
    expect(schedule.totalPaid).toBeCloseTo(1_200_000);
  });

  it('lowers installments after partial forgiveness', () => {
    const schedule = buildSchedule([
      tranche({
        annualRate: 0,
        principal: 1_200_000,
        termMonths: 12,
        events: [{ month: 6, type: 'forgive', amount: 300_000, reason: 'child' }]
      })
    ]);

    expect(schedule.monthlyTotals[5]).toBe(100_000);
    expect(schedule.monthlyTotals[6]).toBe(50_000);
    expect(schedule.totalForgiven).toBe(300_000);
    expect(schedule.totalPaid).toBeCloseTo(900_000);
  });

  it('ends the loan when forgiveness covers the balance', () => {
    const schedule = buildSchedule([
      tranche({
        annualRate: 0,
        principal: 1_200_000,
        termMonths: 12,
        events: [{ month: 3, type: 'forgive', amount: 5_000_000, reason: 'third child' }]
      })
    ]);

    expect(schedule.monthlyTotals).toHaveLength(3);
    expect(schedule.totalForgiven).toBe(900_000);
  });

  it('recalculates the installment on repricing', () => {
    const schedule = buildSchedule([
      tranche({
        principal: 10_000_000,
        annualRate: 0.06,
        termMonths: 240,
        events: [{ month: 120, type: 'reprice', annualRate: 0.08, reason: 'fixation ends' }]
      })
    ]);

    expect(schedule.monthlyTotals[121]).toBeGreaterThan(schedule.monthlyTotals[119] ?? 0);
    expect(schedule.monthlyTotals).toHaveLength(240);
  });

  it('sums parallel tranches and orders the timeline', () => {
    const schedule = buildSchedule([
      tranche({ id: 'a', events: [{ month: 50, type: 'reprice', annualRate: 0.03, reason: 'b' }] }),
      tranche({ id: 'b', events: [{ month: 10, type: 'suspend', months: 1, reason: 'a' }] })
    ]);

    expect(schedule.initialMonthly).toBeCloseTo(2 * 237_105.66, 0);
    expect(schedule.timeline.map((entry) => entry.month)).toEqual([10, 50]);
  });

  it('splits evenly without interest', () => {
    const schedule = buildSchedule([
      tranche({ principal: 1_200_000, annualRate: 0, termMonths: 12 })
    ]);

    expect(schedule.initialMonthly).toBe(100_000);
  });

  it('returns zeros without tranches', () => {
    const schedule = buildSchedule([]);

    expect(schedule.totalPaid).toBe(0);
    expect(schedule.averageMonthly).toBe(0);
  });
});
