import { describe, expect, it } from 'vite-plus/test';
import { checkEligibility, normalizeInput, type HouseholdInput } from './eligibility';

const household = (overrides: Partial<HouseholdInput>): HouseholdInput => {
  return {
    relationship: 'MARRIED',
    applicantAge: 30,
    insuredYears: 5,
    firstHome: true,
    cleanRecord: true,
    excludedPrograms: [],
    pregnant: false,
    childrenBirthMonths: [],
    plannedChildrenMonths: ['2027-06'],
    propertyPrice: 60_000_000,
    propertySize: 60,
    propertyType: 'APARTMENT',
    propertyCondition: 'USED',
    settlementType: 'CITY',
    renovationBudget: 0,
    energyEfficient: false,
    soldHomeValue: 0,
    ownFunds: 10_000_000,
    netIncome: 1_000_000,
    termYears: 25,
    startMonth: '2026-11',
    plannedMarriageMonth: '',
    ...overrides
  };
};

const find = (input: HouseholdInput, program: string) => {
  return checkEligibility(normalizeInput(input)).find((item) => item.program === program);
};

const VILLAGE: Partial<HouseholdInput> = { settlementType: 'VILLAGE', plannedChildrenMonths: [] };

describe('checkEligibility', () => {
  describe('excluded programs', () => {
    it('rules out a program the household already used', () => {
      expect(
        find(household({ excludedPrograms: ['OTTHON_START'] }), 'OTTHON_START')?.eligible
      ).toBe(false);
    });
  });

  describe('Otthon Start', () => {
    it('caps the loan at 90% of the price', () => {
      expect(find(household({ propertyPrice: 30_000_000 }), 'OTTHON_START')?.maxAmount).toBe(
        27_000_000
      );
    });

    it('caps the loan at 50M', () => {
      expect(find(household({}), 'OTTHON_START')?.maxAmount).toBe(50_000_000);
    });

    it('allows a price of exactly 1.5M HUF/m²', () => {
      const result = find(
        household({ propertyPrice: 90_000_000, propertySize: 60 }),
        'OTTHON_START'
      );

      expect(result?.eligible).toBe(true);
    });

    it('rejects a price above 1.5M HUF/m²', () => {
      const result = find(
        household({ propertyPrice: 61_000_000, propertySize: 40 }),
        'OTTHON_START'
      );

      expect(result?.eligible).toBe(false);
    });

    it('allows an apartment exactly at the value cap', () => {
      const result = find(
        household({ propertyPrice: 100_000_000, propertySize: 70 }),
        'OTTHON_START'
      );

      expect(result?.eligible).toBe(true);
    });

    it('allows a house exactly at the 150M value cap', () => {
      const result = find(
        household({ propertyType: 'HOUSE', propertyPrice: 150_000_000, propertySize: 100 }),
        'OTTHON_START'
      );

      expect(result?.eligible).toBe(true);
    });

    it('rejects a house above the value cap', () => {
      const result = find(
        household({ propertyType: 'HOUSE', propertyPrice: 150_100_000, propertySize: 120 }),
        'OTTHON_START'
      );

      expect(result?.eligible).toBe(false);
    });

    it('accepts exactly 2 years of insurance', () => {
      expect(find(household({ insuredYears: 2 }), 'OTTHON_START')?.eligible).toBe(true);
    });

    it('rejects less than 2 years of insurance', () => {
      expect(find(household({ insuredYears: 1 }), 'OTTHON_START')?.eligible).toBe(false);
    });

    it('rejects a repeat buyer', () => {
      expect(find(household({ firstHome: false }), 'OTTHON_START')?.eligible).toBe(false);
    });

    it('rejects an applicant with a criminal record', () => {
      expect(find(household({ cleanRecord: false }), 'OTTHON_START')?.eligible).toBe(false);
    });
  });

  describe('CSOK Plusz', () => {
    it('requires a dearer home than the one the couple sells', () => {
      const other = { firstHome: false, propertyPrice: 60_000_000 };

      expect(find(household({ ...other, soldHomeValue: 60_000_000 }), 'CSOK_PLUSZ')?.eligible).toBe(
        false
      );
      expect(find(household({ ...other, soldHomeValue: 50_000_000 }), 'CSOK_PLUSZ')?.eligible).toBe(
        true
      );
    });

    it('sizes the loan by existing plus promised children', () => {
      const input = household({
        childrenBirthMonths: ['2023-01'],
        plannedChildrenMonths: ['2028-01', '2030-01']
      });

      expect(find(input, 'CSOK_PLUSZ')?.maxAmount).toBe(50_000_000);
    });

    it('caps the loan at 50M from the third child', () => {
      const input = household({
        childrenBirthMonths: ['2020-01', '2022-01', '2024-01'],
        propertySize: 80
      });

      expect(find(input, 'CSOK_PLUSZ')?.maxAmount).toBe(50_000_000);
    });

    it('accepts a single promised child born exactly 4 years after the contract', () => {
      expect(find(household({ plannedChildrenMonths: ['2030-11'] }), 'CSOK_PLUSZ')?.eligible).toBe(
        true
      );
    });

    it('ignores a single promised child born after the 4 year deadline', () => {
      expect(find(household({ plannedChildrenMonths: ['2030-12'] }), 'CSOK_PLUSZ')?.eligible).toBe(
        false
      );
    });

    it('gives two promised children the 8 year deadline, even when the first comes after 4', () => {
      const input = household({ plannedChildrenMonths: ['2032-11', '2033-11'] });

      expect(find(input, 'CSOK_PLUSZ')?.maxAmount).toBe(30_000_000);
    });

    it('accepts a wife of 40', () => {
      expect(find(household({ applicantAge: 40 }), 'CSOK_PLUSZ')?.maxAmount).toBe(15_000_000);
    });

    it('rejects a wife of 41', () => {
      expect(find(household({ applicantAge: 41 }), 'CSOK_PLUSZ')?.eligible).toBe(false);
    });

    it('lifts the age limit during pregnancy', () => {
      expect(find(household({ applicantAge: 42, pregnant: true }), 'CSOK_PLUSZ')?.eligible).toBe(
        true
      );
    });

    it('accepts an apartment exactly at the floor area minimum for 2 children', () => {
      const input = household({ childrenBirthMonths: ['2024-01'], propertySize: 50 });

      expect(find(input, 'CSOK_PLUSZ')?.maxAmount).toBe(30_000_000);
    });

    it('rejects an apartment below the floor area minimum for 2 children', () => {
      const input = household({ childrenBirthMonths: ['2024-01'], propertySize: 49 });

      expect(find(input, 'CSOK_PLUSZ')?.eligible).toBe(false);
    });

    it('allows a 150M apartment for a repeat buyer', () => {
      const input = household({ firstHome: false, propertyPrice: 150_000_000, propertySize: 100 });

      expect(find(input, 'CSOK_PLUSZ')?.eligible).toBe(true);
    });

    it('rejects a 150M apartment as a first home', () => {
      const input = household({ propertyPrice: 150_000_000, propertySize: 100 });

      expect(find(input, 'CSOK_PLUSZ')?.eligible).toBe(false);
    });

    it('requires marriage', () => {
      expect(find(household({ relationship: 'PARTNERS' }), 'CSOK_PLUSZ')?.eligible).toBe(false);
    });
  });

  describe('Babaváró', () => {
    it('requires marriage', () => {
      expect(find(household({ relationship: 'PARTNERS' }), 'BABAVARO')?.eligible).toBe(false);
    });

    it('accepts a wife of 34', () => {
      expect(find(household({ applicantAge: 34 }), 'BABAVARO')?.eligible).toBe(true);
    });

    it('rejects a wife of 35', () => {
      expect(find(household({ applicantAge: 35 }), 'BABAVARO')?.eligible).toBe(false);
    });

    it('accepts a wife of 18', () => {
      expect(find(household({ applicantAge: 18 }), 'BABAVARO')?.eligible).toBe(true);
    });

    it('rejects a wife of 17', () => {
      expect(find(household({ applicantAge: 17 }), 'BABAVARO')?.eligible).toBe(false);
    });

    it('accepts exactly 3 years of insurance', () => {
      expect(find(household({ insuredYears: 3 }), 'BABAVARO')?.eligible).toBe(true);
    });

    it('rejects 2 years of insurance', () => {
      expect(find(household({ insuredYears: 2 }), 'BABAVARO')?.eligible).toBe(false);
    });

    it('accepts a first child exactly 5 years after the contract', () => {
      expect(find(household({ plannedChildrenMonths: ['2031-11'] }), 'BABAVARO')?.eligible).toBe(
        true
      );
    });

    it('stays available without a child in 5 years, the plan prices the penalty', () => {
      expect(find(household({ plannedChildrenMonths: ['2031-12'] }), 'BABAVARO')?.eligible).toBe(
        true
      );
    });

    it('accepts a pregnancy without planned children', () => {
      const input = household({ pregnant: true, plannedChildrenMonths: [] });

      expect(find(input, 'BABAVARO')?.eligible).toBe(true);
    });
  });

  describe('Falusi CSOK', () => {
    it('offers the grant only in villages', () => {
      expect(find(household({}), 'FALUSI_CSOK')?.eligible).toBe(false);
    });

    it('halves the grant toward the price of a used home', () => {
      const input = household({ ...VILLAGE, childrenBirthMonths: ['2020-01', '2022-01'] });

      expect(find(input, 'FALUSI_CSOK')?.maxAmount).toBe(2_000_000);
    });

    it('puts the full grant toward the price of a new home', () => {
      const input = household({
        ...VILLAGE,
        propertyCondition: 'NEW',
        propertyType: 'HOUSE',
        propertySize: 90,
        childrenBirthMonths: ['2020-01', '2022-01', '2024-01']
      });

      expect(find(input, 'FALUSI_CSOK')?.maxAmount).toBe(15_000_000);
    });
  });

  describe('Falusi CSOK-kölcsön', () => {
    const withChildren = (count: number): HouseholdInput => {
      return household({
        ...VILLAGE,
        propertySize: 70,
        childrenBirthMonths: ['2020-01', '2022-01', '2024-01'].slice(0, count)
      });
    };

    it('needs at least two children', () => {
      expect(find(withChildren(1), 'FALUSI_CSOK_LOAN')?.eligible).toBe(false);
    });

    it('lends 10M with two children', () => {
      expect(find(withChildren(2), 'FALUSI_CSOK_LOAN')?.maxAmount).toBe(10_000_000);
    });

    it('lends 15M with three children', () => {
      expect(find(withChildren(3), 'FALUSI_CSOK_LOAN')?.maxAmount).toBe(15_000_000);
    });

    it('applies the grant age limit to promised children', () => {
      const input = household({
        settlementType: 'VILLAGE',
        applicantAge: 45,
        plannedChildrenMonths: ['2027-06', '2029-01']
      });

      expect(find(input, 'FALUSI_CSOK_LOAN')?.eligible).toBe(false);
    });
  });
});

describe('normalizeInput', () => {
  it('treats a negative amount from a shared link as zero', () => {
    expect(normalizeInput(household({ ownFunds: -5_000_000 })).ownFunds).toBe(0);
  });

  it('treats a missing amount from a shared link as zero', () => {
    expect(normalizeInput(household({ netIncome: Number.NaN })).netIncome).toBe(0);
  });

  it('clamps a long term to 35 years', () => {
    expect(normalizeInput(household({ termYears: 50 })).termYears).toBe(35);
  });

  it('clamps an empty term to 5 years', () => {
    expect(normalizeInput(household({ termYears: 0 })).termYears).toBe(5);
  });

  it('drops invalid and past planned children', () => {
    const input = normalizeInput(household({ plannedChildrenMonths: ['2027-01', '2026-10', 'x'] }));

    expect(input.plannedChildrenMonths).toEqual(['2027-01']);
  });

  it('drops a planned wedding of a married couple', () => {
    expect(
      normalizeInput(household({ plannedMarriageMonth: '2027-05' })).plannedMarriageMonth
    ).toBe('');
  });

  it('drops programs that cannot be excluded', () => {
    const input = normalizeInput(
      household({ excludedPrograms: ['MORTGAGE_FORGIVENESS', 'BABAVARO'] })
    );

    expect(input.excludedPrograms).toEqual(['BABAVARO']);
  });
});

describe('Falusi CSOK for partners and single parents', () => {
  const village = { settlementType: 'VILLAGE' as const, propertySize: 70 };

  it('grants partners for the children they already have', () => {
    const input = household({
      ...village,
      relationship: 'PARTNERS',
      childrenBirthMonths: ['2022-01', '2024-01'],
      plannedChildrenMonths: []
    });

    expect(find(input, 'FALUSI_CSOK')?.maxAmount).toBe(2_000_000);
  });

  it('ignores children promised by partners', () => {
    const input = household({ ...village, relationship: 'PARTNERS' });

    expect(find(input, 'FALUSI_CSOK')?.eligible).toBe(false);
  });

  it('grants a single parent for an existing child', () => {
    const input = household({
      ...village,
      relationship: 'SINGLE',
      childrenBirthMonths: ['2022-01'],
      plannedChildrenMonths: [],
      propertyCondition: 'NEW'
    });

    expect(find(input, 'FALUSI_CSOK')?.maxAmount).toBe(1_000_000);
  });
});
