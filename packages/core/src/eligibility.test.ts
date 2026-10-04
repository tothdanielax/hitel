import { describe, expect, it } from 'vite-plus/test';
import { checkEligibility, type HouseholdInput } from './eligibility';

const household = (overrides: Partial<HouseholdInput>): HouseholdInput => {
  return {
    relationship: 'MARRIED',
    applicantAge: 30,
    partnerAge: 30,
    insuredYears: 5,
    firstHome: true,
    cleanRecord: true,
    pregnant: false,
    childrenBirthMonths: [],
    plannedChildrenMonths: ['2027-06'],
    propertyPrice: 60_000_000,
    propertySize: 60,
    propertyType: 'APARTMENT',
    propertyCondition: 'USED',
    settlementType: 'CITY',
    ownFunds: 10_000_000,
    netIncome: 1_000_000,
    termYears: 25,
    startMonth: '2026-11',
    ...overrides
  };
};

const find = (input: HouseholdInput, program: string) => {
  return checkEligibility(input).find((item) => item.program === program);
};

describe('checkEligibility', () => {
  it('caps Otthon Start at 90% of the price', () => {
    expect(find(household({ propertyPrice: 30_000_000 }), 'OTTHON_START')?.maxAmount).toBe(
      27_000_000
    );
  });

  it('rejects Otthon Start above 1.5M HUF/m²', () => {
    const result = find(household({ propertyPrice: 61_000_000, propertySize: 40 }), 'OTTHON_START');

    expect(result?.eligible).toBe(false);
  });

  it('allows an apartment exactly at the Otthon Start value cap', () => {
    const result = find(
      household({ propertyPrice: 100_000_000, propertySize: 70 }),
      'OTTHON_START'
    );

    expect(result?.eligible).toBe(true);
  });

  it('rejects Otthon Start without 2 years of insurance', () => {
    expect(find(household({ insuredYears: 1 }), 'OTTHON_START')?.eligible).toBe(false);
  });

  it('sizes CSOK Plusz by existing plus promised children', () => {
    const input = household({
      childrenBirthMonths: ['2023-01'],
      plannedChildrenMonths: ['2028-01', '2030-01']
    });

    expect(find(input, 'CSOK_PLUSZ')?.maxAmount).toBe(50_000_000);
  });

  it('ignores promised children beyond the CSOK Plusz deadline', () => {
    const input = household({ plannedChildrenMonths: ['2032-01'] });

    expect(find(input, 'CSOK_PLUSZ')?.eligible).toBe(false);
  });

  it('lifts the CSOK Plusz age limit during pregnancy', () => {
    expect(find(household({ applicantAge: 42 }), 'CSOK_PLUSZ')?.eligible).toBe(false);
    expect(find(household({ applicantAge: 42, pregnant: true }), 'CSOK_PLUSZ')?.eligible).toBe(
      true
    );
  });

  it('requires marriage for CSOK Plusz and Babaváró', () => {
    const input = household({ relationship: 'PARTNERS' });

    expect(find(input, 'CSOK_PLUSZ')?.eligible).toBe(false);
    expect(find(input, 'BABAVARO')?.eligible).toBe(false);
  });

  it('rejects Babaváró at 35', () => {
    expect(find(household({ applicantAge: 34 }), 'BABAVARO')?.eligible).toBe(true);
    expect(find(household({ applicantAge: 35 }), 'BABAVARO')?.eligible).toBe(false);
  });

  it('halves the Falusi CSOK grant toward the price of a used home', () => {
    const input = household({
      settlementType: 'VILLAGE',
      childrenBirthMonths: ['2020-01', '2022-01'],
      plannedChildrenMonths: []
    });

    expect(find(input, 'FALUSI_CSOK')?.maxAmount).toBe(2_000_000);
  });

  it('offers Falusi CSOK only in villages', () => {
    expect(find(household({}), 'FALUSI_CSOK')?.eligible).toBe(false);
  });
});
