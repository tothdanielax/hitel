import { describe, expect, it } from 'vite-plus/test';
import { addMonths, dateToMonth, formatMonth, monthToDate, monthsBetween } from './date';

describe('monthsBetween', () => {
  it('counts across years', () => {
    expect(monthsBetween('2026-11', '2028-01')).toBe(14);
  });

  it('is negative for earlier months', () => {
    expect(monthsBetween('2026-11', '2026-09')).toBe(-2);
  });
});

describe('addMonths', () => {
  it('rolls over into the next year', () => {
    expect(addMonths('2026-11', 3)).toBe('2027-02');
  });

  it('pads single digit months', () => {
    expect(addMonths('2026-01', 0)).toBe('2026-01');
  });

  it('lands on December without overflowing', () => {
    expect(addMonths('2026-01', 11)).toBe('2026-12');
  });
});

describe('formatMonth', () => {
  it('names the month in Hungarian', () => {
    expect(formatMonth('2027-09')).toBe('2027. szeptember');
  });
});

describe('monthToDate', () => {
  it('round trips through dateToMonth', () => {
    expect(dateToMonth(monthToDate('2026-12'))).toBe('2026-12');
  });

  it('lands on the 1st', () => {
    expect(monthToDate('2026-03').getDate()).toBe(1);
  });
});
