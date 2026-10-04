import { describe, expect, it } from 'vite-plus/test';
import type { HouseholdInput } from './eligibility';
import { buildPlan, type Plan } from './plan';
import { DEFAULT_SETTINGS, type PlanSettings } from './settings';

const SETTINGS: PlanSettings = {
  ...DEFAULT_SETTINGS,
  offers: [
    {
      id: 'test-0',
      bankName: 'Test Bank',
      product: 'Fix 10',
      kind: 'MARKET',
      annualRate: 0.06,
      fixationYears: 10,
      source: { url: '', asOf: '2026-10-04' },
      enabled: true
    },
    {
      id: 'test-1',
      bankName: 'Test Bank',
      product: 'Otthon Start',
      kind: 'OTTHON_START',
      annualRate: 0.03,
      fixationYears: 0,
      source: { url: '', asOf: '2026-10-04' },
      enabled: true
    }
  ]
};

// Every title and detail line of the timeline.
const texts = (result: Plan): string[] => {
  return result.timeline.flatMap((entry) =>
    entry.items.flatMap((item) => [item.title, ...item.details])
  );
};

const household = (overrides: Partial<HouseholdInput>): HouseholdInput => {
  return {
    relationship: 'SINGLE',
    applicantAge: 30,
    partnerAge: 30,
    insuredYears: 5,
    firstHome: true,
    cleanRecord: true,
    excludedPrograms: [],
    pregnant: false,
    childrenBirthMonths: [],
    plannedChildrenMonths: [],
    propertyPrice: 60_000_000,
    propertySize: 60,
    propertyType: 'APARTMENT',
    propertyCondition: 'USED',
    settlementType: 'CITY',
    renovationBudget: 0,
    ownFunds: 10_000_000,
    netIncome: 1_500_000,
    termYears: 25,
    startMonth: '2026-11',
    plannedMarriageMonth: '',
    ...overrides
  };
};

const plan = (overrides: Partial<HouseholdInput>, settings: PlanSettings = SETTINGS) => {
  return buildPlan(household(overrides), settings);
};

const loanIds = (overrides: Partial<HouseholdInput>): string[] => {
  return plan(overrides).loans.map((loan) => loan.id);
};

const YOUNG_FAMILY: Partial<HouseholdInput> = {
  relationship: 'MARRIED',
  propertyPrice: 90_000_000,
  propertySize: 70,
  plannedChildrenMonths: ['2027-09', '2030-03']
};

describe('buildPlan', () => {
  it('finances a single first-time buyer with Otthon Start only', () => {
    expect(loanIds({})).toEqual(['OTTHON_START']);
  });

  it('caps Otthon Start at 50M', () => {
    expect(plan({}).loans[0]?.amount).toBe(50_000_000);
  });

  it('charges the known Otthon Start installment (50M, 3%, 25y)', () => {
    expect(Math.round(plan({}).schedule.initialMonthly)).toBe(237_106);
  });

  it('tops up with a bank loan above the Otthon Start cap', () => {
    const result = plan({ propertyPrice: 80_000_000, propertySize: 80 });

    expect(result.loans.map((loan) => loan.amount).toSorted((a, b) => b - a)).toEqual([
      50_000_000, 20_000_000
    ]);
  });

  it('reprices the bank loan when its fixation ends', () => {
    const titles = texts(plan({ propertyPrice: 80_000_000, propertySize: 80 }));

    expect(titles.some((title) => title.includes('átárazás'))).toBe(true);
  });

  it('respects the 80% loan-to-value limit for repeat buyers', () => {
    expect(plan({ firstHome: false }).loans[0]?.amount).toBe(48_000_000);
  });

  it('warns about missing own funds when loans cannot cover the price', () => {
    expect(plan({ firstHome: false }).warnings).toContain(
      'A hitelek nem fedezik a teljes vételárat, több önerő szükséges'
    );
  });

  it('combines Babaváró, CSOK Plusz and Otthon Start for a young married couple', () => {
    expect(loanIds(YOUNG_FAMILY).toSorted()).toEqual(['BABAVARO', 'CSOK_PLUSZ', 'OTTHON_START']);
  });

  it('forgives 10M on CSOK Plusz for the second child', () => {
    const result = plan({
      relationship: 'MARRIED',
      childrenBirthMonths: ['2024-01'],
      plannedChildrenMonths: ['2028-01'],
      applicantAge: 36
    });

    expect(result.loans.find((loan) => loan.id === 'CSOK_PLUSZ')?.totalForgiven).toBe(10_000_000);
  });

  it('applies jelzáloghitel-elengedés on Otthon Start for the second child', () => {
    const result = plan({ childrenBirthMonths: ['2024-01'], plannedChildrenMonths: ['2028-01'] });

    expect(result.loans.find((loan) => loan.id === 'OTTHON_START')?.totalForgiven).toBe(1_000_000);
  });

  it('adds the Falusi CSOK grant in a village', () => {
    const result = plan({
      relationship: 'MARRIED',
      settlementType: 'VILLAGE',
      propertyType: 'HOUSE',
      propertySize: 100,
      childrenBirthMonths: ['2020-01', '2022-01', '2024-01']
    });

    expect(result.grant).toBe(7_500_000);
  });

  it('waives stamp duty with Falusi CSOK', () => {
    const result = plan({
      relationship: 'MARRIED',
      settlementType: 'VILLAGE',
      propertyType: 'HOUSE',
      propertySize: 100,
      childrenBirthMonths: ['2020-01']
    });

    expect(result.stampDuty).toBe(0);
  });

  it('charges 4% stamp duty on a used home without CSOK', () => {
    expect(plan({}).stampDuty).toBe(2_400_000);
  });

  it('never combines CSOK Plusz with Falusi CSOK-kölcsön', () => {
    const ids = loanIds({
      relationship: 'MARRIED',
      settlementType: 'VILLAGE',
      propertyType: 'HOUSE',
      propertySize: 100,
      propertyPrice: 120_000_000,
      ownFunds: 20_000_000,
      firstHome: false,
      childrenBirthMonths: ['2020-01', '2022-01'],
      plannedChildrenMonths: ['2028-01']
    });

    expect(ids.includes('CSOK_PLUSZ') && ids.includes('FALUSI_CSOK_LOAN')).toBe(false);
  });

  it('groups same-month events into one timeline entry', () => {
    const result = plan({
      relationship: 'MARRIED',
      childrenBirthMonths: ['2024-01'],
      plannedChildrenMonths: ['2028-01'],
      propertyPrice: 90_000_000,
      propertySize: 70
    });

    expect(
      result.timeline.find((entry) => entry.month === '2028-01')?.items.length
    ).toBeGreaterThan(1);
  });

  it('merges same-month events of one loan into one title', () => {
    const items = plan({ relationship: 'MARRIED', plannedChildrenMonths: ['2027-09', '2029-09'] })
      .timeline.flatMap((entry) => entry.items)
      .filter((item) => item.title === 'Babaváró: 2. gyermek');

    expect(items).toEqual([
      { title: 'Babaváró: 2. gyermek', details: ['30% elengedés', 'szüneteltetés 3 évre'] }
    ]);
  });

  it('shows when a paused loan is repaid again', () => {
    const result = plan({ relationship: 'MARRIED', plannedChildrenMonths: ['2027-09'] });

    expect(texts(result)).toContain('Babaváró: szüneteltetés vége, a törlesztés újraindul');
  });

  it('ignores blank and past planned-child rows', () => {
    const result = plan({ relationship: 'MARRIED', plannedChildrenMonths: ['', '2020-01'] });

    expect(result.eligibility.find((item) => item.program === 'CSOK_PLUSZ')?.eligible).toBe(false);
  });

  it('counts planned children by date, not entry order', () => {
    const sorted = plan({ ...YOUNG_FAMILY, plannedChildrenMonths: ['2027-11', '2031-11'] });
    const reversed = plan({ ...YOUNG_FAMILY, plannedChildrenMonths: ['2031-11', '2027-11'] });

    expect(reversed.eligibility).toEqual(sorted.eligibility);
  });

  it('clamps an empty term instead of dropping the loans', () => {
    expect(plan({ termYears: 0 }).schedule.initialMonthly).toBeGreaterThan(0);
  });

  it('recommends pausing Babaváró after the first child', () => {
    const result = plan({ relationship: 'MARRIED', plannedChildrenMonths: ['2027-09'] });

    expect(result.tips.some((tip) => tip.startsWith('Babaváró, 1. gyermek: szüneteltetés'))).toBe(
      true
    );
  });

  it('skips optional pauses that bring no gain', () => {
    const result = plan(
      { relationship: 'MARRIED', plannedChildrenMonths: ['2027-09'] },
      { ...SETTINGS, bondYield: 0 }
    );

    expect(result.tips.some((tip) => tip.includes('szüneteltetés'))).toBe(false);
  });

  it('warns when installments exceed the JTM limit', () => {
    expect(plan({ netIncome: 300_000 }).warnings).toContain(
      'A törlesztőrészlet meghaladja a jövedelemarányos (JTM) korlátot'
    );
  });

  it('needs no loan when own funds cover the price and keeping them is off', () => {
    expect(plan({ ownFunds: 60_000_000 }, { ...SETTINGS, keepOwnFunds: false }).loans).toEqual([]);
  });

  it('borrows the cheap loan and keeps own funds when bonds earn more', () => {
    const result = plan({ ownFunds: 60_000_000 });

    expect(result.cashKept).toBe(50_000_000);
  });

  it('spends own funds when bonds earn less than the loans cost', () => {
    expect(plan({ ownFunds: 60_000_000 }, { ...SETTINGS, bondYield: 0.01 }).loans).toEqual([]);
  });

  it('borrows up to the JTM limit and keeps the rest of the own funds', () => {
    const result = plan({ ownFunds: 30_000_000, netIncome: 400_000 });

    expect(result.paymentToIncome).toBeLessThanOrEqual(result.paymentToIncomeLimit);
    expect(result.cashKept).toBeGreaterThan(0);
    expect(result.cashKept).toBeLessThan(30_000_000);
  });

  it('averages the compounded bond return of the kept cash over the term', () => {
    const result = plan({ ownFunds: 60_000_000 });
    const total = 50_000_000 * (1.0548 ** 25 - 1);

    expect(result.investmentReturn.monthlyAverage).toBeCloseTo(total / 300, 0);
  });

  it('starts the investment return at the first year interest', () => {
    expect(plan({ ownFunds: 60_000_000 }).investmentReturn.initialMonthly).toBeCloseTo(
      (50_000_000 * 0.0548) / 12,
      0
    );
  });

  it('reports how much of the own funds it spends', () => {
    const result = plan({ ownFunds: 30_000_000, netIncome: 400_000 });

    expect(result.ownFundsUsed + result.cashKept).toBe(30_000_000);
  });

  it('requires own funds for the down payment when Babaváró does not count', () => {
    const result = plan(
      { ...YOUNG_FAMILY, propertyPrice: 60_000_000, ownFunds: 0 },
      { ...SETTINGS, babavaroAsDownPayment: false }
    );

    expect(result.warnings.some((warning) => warning.includes('saját önerő szükséges'))).toBe(true);
  });

  it('spends at least the down payment from own funds when Babaváró does not count', () => {
    const result = plan(
      { ...YOUNG_FAMILY, propertyPrice: 60_000_000, ownFunds: 20_000_000 },
      { ...SETTINGS, babavaroAsDownPayment: false }
    );

    expect(result.ownFundsUsed).toBeGreaterThanOrEqual(6_000_000);
  });

  it('accepts Babaváró as down payment when the bank does', () => {
    const result = plan({ ...YOUNG_FAMILY, propertyPrice: 60_000_000, ownFunds: 0 });

    expect(result.warnings.some((warning) => warning.includes('saját önerő szükséges'))).toBe(
      false
    );
  });

  it('never lets a single buyer borrow the down payment', () => {
    expect(plan({ ownFunds: 30_000_000 }).ownFundsUsed).toBeGreaterThanOrEqual(6_000_000);
  });

  it('does not double count mortgage forgiveness next to CSOK Plusz', () => {
    const titles = texts(plan(YOUNG_FAMILY));

    expect(titles.some((title) => title.includes('jelzáloghitel-elengedés'))).toBe(false);
  });

  it('never plans an excluded program', () => {
    expect(loanIds({ ...YOUNG_FAMILY, excludedPrograms: ['BABAVARO'] })).not.toContain('BABAVARO');
  });

  describe('planned wedding', () => {
    const ENGAGED: Partial<HouseholdInput> = {
      applicantAge: 28,
      propertyPrice: 70_000_000,
      ownFunds: 7_000_000,
      plannedChildrenMonths: ['2028-09', '2030-09'],
      plannedMarriageMonth: '2027-11'
    };

    it('prepays a loan dearer than bonds with a Babaváró taken after the wedding', () => {
      const babavaro = plan(ENGAGED).marriage?.babavaro;

      expect([babavaro?.use, babavaro?.target]).toEqual(['PREPAY', 'Test Bank Fix 10']);
    });

    it('invests the later Babaváró when every loan is cheaper than bonds', () => {
      const result = plan({ ...ENGAGED, propertyPrice: 50_000_000, ownFunds: 10_000_000 });

      expect(result.marriage?.babavaro?.use).toBe('INVEST');
    });

    it('compares buying only after the wedding', () => {
      expect(plan(ENGAGED).marriage?.buyAfter.loans).toContain('CSOK Plusz');
    });

    it('ignores the wedding for married couples', () => {
      expect(plan({ ...ENGAGED, relationship: 'MARRIED' }).marriage).toBeUndefined();
    });

    it('has no outlook without a planned wedding', () => {
      expect(plan({}).marriage).toBeUndefined();
    });
  });

  it('keeps the unneeded part of Babaváró when borrowing pays off', () => {
    const result = plan({ ...YOUNG_FAMILY, propertyPrice: 50_000_000, ownFunds: 40_000_000 });

    expect(result.loans.find((loan) => loan.id === 'BABAVARO')?.amount).toBe(11_000_000);
  });

  it('pays renovation from own funds, never from Otthon Start', () => {
    const result = plan(
      { propertyPrice: 50_000_000, ownFunds: 15_000_000, renovationBudget: 10_000_000 },
      { ...SETTINGS, keepOwnFunds: false }
    );

    expect(result.loans.map((loan) => [loan.id, loan.amount])).toEqual([
      ['OTTHON_START', 45_000_000]
    ]);
  });

  it('warns when the renovation cannot be financed', () => {
    const result = plan(
      { propertyPrice: 50_000_000, ownFunds: 5_000_000, renovationBudget: 10_000_000 },
      { ...SETTINGS, keepOwnFunds: false }
    );

    expect(result.warnings).toContain(
      'A hitelek és az önerő nem fedezik a vételárat és a felújítást'
    );
  });

  it('puts the modernization part of a used home Falusi CSOK toward the renovation', () => {
    const village: Partial<HouseholdInput> = {
      ...YOUNG_FAMILY,
      settlementType: 'VILLAGE',
      propertySize: 80
    };

    expect(plan({ ...village, renovationBudget: 3_000_000 }).grant).toBeGreaterThan(
      plan(village).grant
    );
  });

  it('shrinks CSOK Plusz to what its forgiveness needs when a cheaper loan takes the rest', () => {
    const settings: PlanSettings = {
      ...SETTINGS,
      keepOwnFunds: false,
      offers: SETTINGS.offers.map((offer) =>
        offer.kind === 'OTTHON_START' ? { ...offer, annualRate: 0.025 } : offer
      )
    };
    const csokPlusz = plan({ ...YOUNG_FAMILY, propertyPrice: 80_000_000 }, settings).loans.find(
      (loan) => loan.id === 'CSOK_PLUSZ'
    );

    expect(csokPlusz?.amount).toBeLessThan(30_000_000);
    expect(csokPlusz?.totalForgiven).toBe(10_000_000);
  });

  it('uses the cheapest enabled Otthon Start offer', () => {
    const settings: PlanSettings = {
      ...SETTINGS,
      offers: SETTINGS.offers.map((offer) =>
        offer.kind === 'OTTHON_START' ? { ...offer, annualRate: 0.028 } : offer
      )
    };

    expect(plan({}, settings).loans[0]?.annualRate).toBe(0.028);
  });

  it('caps a user-entered Otthon Start rate at the legal 3%', () => {
    const settings: PlanSettings = {
      ...SETTINGS,
      offers: SETTINGS.offers.map((offer) =>
        offer.kind === 'OTTHON_START' ? { ...offer, annualRate: 0.05 } : offer
      )
    };

    expect(plan({}, settings).loans[0]?.annualRate).toBe(0.03);
  });

  it('caps a user-entered CSOK Plusz rate at the legal 3%', () => {
    const result = plan(YOUNG_FAMILY, { ...SETTINGS, csokPluszRate: 0.05 });

    expect(result.loans.find((loan) => loan.id === 'CSOK_PLUSZ')?.annualRate).toBe(0.03);
  });

  it('skips disabled bank offers', () => {
    const settings: PlanSettings = {
      ...SETTINGS,
      offers: SETTINGS.offers.map((offer) => ({ ...offer, enabled: offer.kind !== 'MARKET' }))
    };

    expect(plan({ propertyPrice: 80_000_000, propertySize: 80 }, settings).warnings).toContain(
      'Nincs bekapcsolt banki ajánlat a kiegészítő hitelhez'
    );
  });

  it('uses the user-set reprice rate after fixation', () => {
    const titles = texts(
      plan({ propertyPrice: 80_000_000, propertySize: 80 }, { ...SETTINGS, repriceRate: 0.09 })
    );

    expect(titles.some((title) => title.includes('9%'))).toBe(true);
  });
});
