import { describe, expect, it } from 'vite-plus/test';
import { monthlyPayment } from './annuity';

describe('monthlyPayment', () => {
  it('splits evenly without interest', () => {
    expect(monthlyPayment(1_200_000, 0, 12)).toBe(100_000);
  });

  it('matches the annuity formula for Otthon Start (50M, 3%, 25y)', () => {
    expect(Math.round(monthlyPayment(50_000_000, 0.03, 300))).toBe(237_106);
  });
});
