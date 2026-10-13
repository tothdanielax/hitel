import { describe, expect, it } from 'vite-plus/test';
import type { HouseholdInput } from './eligibility';
import { buildPlan, type Plan } from './plan';
import { DEFAULT_SETTINGS, type OfferSetting, type PlanSettings } from './settings';
import { sum } from './utils/math';

const MARKET_OFFER: OfferSetting = {
  id: 'test-0',
  bankName: 'Test Bank',
  product: 'Fix 10',
  kind: 'MARKET',
  annualRate: 0.06,
  fixationYears: 10,
  source: { url: '', asOf: '2026-10-04' },
  enabled: true
};

const SETTINGS: PlanSettings = {
  ...DEFAULT_SETTINGS,
  offers: [
    MARKET_OFFER,
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

const SPEND_OWN_FUNDS: PlanSettings = { ...SETTINGS, keepOwnFunds: false };

const household = (overrides: Partial<HouseholdInput>): HouseholdInput => {
  return {
    relationship: 'SINGLE',
    applicantAge: 30,
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
    energyEfficient: false,
    soldHomeValue: 0,
    ownFunds: 10_000_000,
    netIncome: 1_500_000,
    termYears: 25,
    startMonth: '2026-11',
    plannedMarriageMonth: '',
    ...overrides
  };
};

const plan = (overrides: Partial<HouseholdInput>, settings: PlanSettings = SETTINGS): Plan => {
  return buildPlan(household(overrides), settings);
};

const loanIds = (overrides: Partial<HouseholdInput>): string[] => {
  return plan(overrides).loans.map((loan) => loan.id);
};

const findLoan = (result: Plan, id: string) => {
  return result.loans.find((loan) => loan.id === id);
};

const loanAmounts = (result: Plan): [string, number][] => {
  return result.loans.map((loan) => [loan.id, loan.amount]);
};

const scheduleMonths = (result: Plan, loan: string): number[] => {
  return result.schedule.timeline
    .filter((entry) => entry.loan === loan)
    .map((entry) => entry.month);
};

const marketOnly = (fixationYears: number): PlanSettings => {
  return { ...SETTINGS, offers: [{ ...MARKET_OFFER, fixationYears }] };
};

const isUncovered = (result: Plan): boolean => {
  return result.warnings.some((warning) => warning.includes('nem fedezik'));
};

const YOUNG_FAMILY: Partial<HouseholdInput> = {
  relationship: 'MARRIED',
  propertyPrice: 90_000_000,
  propertySize: 70,
  plannedChildrenMonths: ['2027-09', '2030-03']
};

const REPEAT_BUYER: Partial<HouseholdInput> = { firstHome: false, ownFunds: 12_000_000 };

describe('buildPlan', () => {
  describe('loan selection', () => {
    it('combines Otthon Start with the Falusi CSOK-kölcsön', () => {
      const ids = loanIds({
        relationship: 'MARRIED',
        settlementType: 'VILLAGE',
        childrenBirthMonths: ['2022-01', '2024-01'],
        propertyPrice: 70_000_000,
        propertySize: 80,
        ownFunds: 7_000_000
      });

      expect(ids).toEqual(expect.arrayContaining(['OTTHON_START', 'FALUSI_CSOK_LOAN']));
    });

    it('charges only interest in the first CSOK Plusz year', () => {
      const result = plan(
        {
          relationship: 'MARRIED',
          plannedChildrenMonths: ['2027-09'],
          excludedPrograms: ['OTTHON_START', 'BABAVARO'],
          propertyPrice: 30_000_000,
          propertySize: 50,
          ownFunds: 15_000_000
        },
        SPEND_OWN_FUNDS
      );

      expect(findLoan(result, 'CSOK_PLUSZ')?.amount).toBe(15_000_000);
      expect(result.schedule.initialMonthly).toBeCloseTo(37_500, 2);
    });

    it('tests the full CSOK Plusz installment against income, not the interest only one', () => {
      const result = plan(
        {
          relationship: 'MARRIED',
          plannedChildrenMonths: ['2027-09'],
          excludedPrograms: ['OTTHON_START', 'BABAVARO'],
          propertyPrice: 30_000_000,
          propertySize: 50,
          ownFunds: 15_000_000
        },
        SPEND_OWN_FUNDS
      );

      expect(result.paymentToIncome * 1_500_000).toBeCloseTo(71_131.7, 0);
    });

    it('warns that Otthon Start rules may change for contracts from 2027', () => {
      const warning =
        'Az Otthon Start feltételei 2027-től szigorodhatnak, a szerződés előtt ellenőrizd';

      expect(plan({ startMonth: '2027-01' }).warnings).toContain(warning);
      expect(plan({}).warnings).not.toContain(warning);
    });

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

    it('combines Babaváró, CSOK Plusz and Otthon Start for a young married couple', () => {
      expect(loanIds(YOUNG_FAMILY).toSorted()).toEqual(['BABAVARO', 'CSOK_PLUSZ', 'OTTHON_START']);
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

    it('never plans an excluded program', () => {
      expect(loanIds({ ...YOUNG_FAMILY, excludedPrograms: ['BABAVARO'] })).not.toContain(
        'BABAVARO'
      );
    });

    it('never plans CSOK Plusz below its minimum amount', () => {
      const result = plan(
        {
          relationship: 'MARRIED',
          plannedChildrenMonths: ['2027-09'],
          excludedPrograms: ['OTTHON_START', 'BABAVARO'],
          ownFunds: 59_700_000
        },
        SPEND_OWN_FUNDS
      );

      expect(result.loans.map((loan) => loan.id)).not.toContain('CSOK_PLUSZ');
    });

    it('shrinks CSOK Plusz to what its forgiveness needs when a cheaper loan takes the rest', () => {
      const settings: PlanSettings = {
        ...SPEND_OWN_FUNDS,
        offers: SETTINGS.offers.map((offer) =>
          offer.kind === 'OTTHON_START' ? { ...offer, annualRate: 0.025 } : offer
        )
      };
      const csokPlusz = findLoan(
        plan({ ...YOUNG_FAMILY, propertyPrice: 80_000_000 }, settings),
        'CSOK_PLUSZ'
      );

      expect(csokPlusz?.amount).toBeLessThan(30_000_000);
      expect(csokPlusz?.totalForgiven).toBe(10_000_000);
    });

    it('keeps the unneeded part of Babaváró when borrowing pays off', () => {
      const result = plan({ ...YOUNG_FAMILY, propertyPrice: 50_000_000, ownFunds: 40_000_000 });

      expect(findLoan(result, 'BABAVARO')?.amount).toBe(11_000_000);
    });

    it('spreads Babaváró over its longest term, under the installment cap', () => {
      const babavaro = findLoan(plan(YOUNG_FAMILY), 'BABAVARO');

      expect(babavaro?.termMonths).toBe(240);
      expect(babavaro?.initialMonthly).toBeCloseTo(48_172.73, 1);
    });

    it('clamps an empty term to the 5 year minimum', () => {
      expect(plan({ termYears: 0 }).loans[0]?.termMonths).toBe(60);
    });
  });

  describe('bank offers', () => {
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

      expect(findLoan(result, 'CSOK_PLUSZ')?.annualRate).toBe(0.03);
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

    it('picks the bank offer by total cost, not by its starting rate', () => {
      const result = plan(REPEAT_BUYER, {
        ...SETTINGS,
        offers: [
          { ...MARKET_OFFER, id: 'short', product: 'Fix 1', annualRate: 0.059, fixationYears: 1 },
          { ...MARKET_OFFER, id: 'long', product: 'Végig fix', annualRate: 0.06, fixationYears: 0 }
        ]
      });

      expect(result.loans.map((loan) => loan.name)).toEqual(['Test Bank Végig fix']);
    });

    it('reprices the bank loan to the market rate when its fixation ends', () => {
      const result = plan({ propertyPrice: 80_000_000, propertySize: 80 });

      expect(
        [result.schedule.monthlyTotals[119], result.schedule.monthlyTotals[120]].map((value) =>
          Math.round(value ?? 0)
        )
      ).toEqual([365_966, 375_644]);
    });

    it('uses the user-set reprice rate after fixation', () => {
      const result = plan(
        { propertyPrice: 80_000_000, propertySize: 80 },
        { ...SETTINGS, repriceRate: 0.09 }
      );

      expect(Math.round(result.schedule.monthlyTotals[120] ?? 0)).toBe(391_988);
    });
  });

  describe('loan-to-value', () => {
    it('lends 90% for an energy efficient home, even to a repeat buyer', () => {
      const result = plan(
        { ...REPEAT_BUYER, energyEfficient: true, ownFunds: 6_000_000 },
        marketOnly(10)
      );

      expect(sum(result.loans.map((loan) => loan.amount))).toBe(54_000_000);
    });

    it('lends a first-time buyer 90% of the price', () => {
      const result = plan(
        { propertyPrice: 40_000_000, propertySize: 40, ownFunds: 0 },
        SPEND_OWN_FUNDS
      );

      expect(loanAmounts(result)).toEqual([['OTTHON_START', 36_000_000]]);
    });

    it('tops up a first home with a bank loan only up to 90% of the price', () => {
      const result = plan(
        { propertyPrice: 80_000_000, propertySize: 80, ownFunds: 5_000_000 },
        SPEND_OWN_FUNDS
      );

      expect(loanAmounts(result)).toEqual([
        ['OTTHON_START', 50_000_000],
        ['bank-test-0', 22_000_000]
      ]);
    });

    it('lends a repeat buyer 80% of the price', () => {
      expect(plan({ firstHome: false }).loans[0]?.amount).toBe(48_000_000);
    });

    it('lends a repeat buyer at most 80% even with a bank loan', () => {
      const result = plan({ firstHome: false, propertyPrice: 80_000_000 }, SPEND_OWN_FUNDS);

      expect(loanAmounts(result)).toEqual([['bank-test-0', 64_000_000]]);
    });

    it('warns about missing own funds when loans cannot cover the price', () => {
      expect(plan({ firstHome: false }).warnings).toContain(
        'A hitelek nem fedezik a teljes vételárat, több önerő szükséges'
      );
    });
  });

  describe('JTM limit', () => {
    it('allows 60% for an energy efficient home fixed for 10 years at low income', () => {
      const result = plan(
        { ...REPEAT_BUYER, energyEfficient: true, netIncome: 700_000 },
        marketOnly(10)
      );

      expect(result.paymentToIncomeLimit).toBe(0.6);
    });

    it('keeps the 5 year band for an energy efficient home', () => {
      const result = plan(
        { ...REPEAT_BUYER, energyEfficient: true, netIncome: 700_000 },
        marketOnly(5)
      );

      expect(result.paymentToIncomeLimit).toBe(0.35);
    });

    it('allows 60% for a fixed-for-term plan at the 800k income threshold', () => {
      expect(plan({ netIncome: 800_000 }).paymentToIncomeLimit).toBe(0.6);
    });

    it('allows 50% for a fixed-for-term plan below the income threshold', () => {
      expect(plan({ netIncome: 799_999 }).paymentToIncomeLimit).toBe(0.5);
    });

    it('allows 30% under a 1 year fixation at high income', () => {
      expect(plan(REPEAT_BUYER, marketOnly(1)).paymentToIncomeLimit).toBe(0.3);
    });

    it('allows 25% under a 1 year fixation at low income', () => {
      const result = plan({ ...REPEAT_BUYER, netIncome: 700_000 }, marketOnly(1));

      expect(result.paymentToIncomeLimit).toBe(0.25);
    });

    it('allows 40% under a 5 year fixation at high income', () => {
      expect(plan(REPEAT_BUYER, marketOnly(5)).paymentToIncomeLimit).toBe(0.4);
    });

    it('allows 35% under a 5 year fixation at low income', () => {
      const result = plan({ ...REPEAT_BUYER, netIncome: 700_000 }, marketOnly(5));

      expect(result.paymentToIncomeLimit).toBe(0.35);
    });

    it('allows 60% under a 10 year fixation at high income', () => {
      expect(plan(REPEAT_BUYER, marketOnly(10)).paymentToIncomeLimit).toBe(0.6);
    });

    it('measures the installment against the net income', () => {
      const result = plan({ ...REPEAT_BUYER, netIncome: 700_000 }, marketOnly(1));

      expect(result.paymentToIncome).toBeCloseTo(309_264.67 / 700_000, 4);
    });

    it('warns when installments exceed the JTM limit', () => {
      expect(plan({ netIncome: 300_000 }).warnings).toContain(
        'A törlesztőrészlet meghaladja a jövedelemarányos (JTM) korlátot'
      );
    });

    it('passes the JTM check without income when no loan is needed', () => {
      const result = plan({ ownFunds: 70_000_000, netIncome: 0 }, SPEND_OWN_FUNDS);

      expect([result.paymentToIncome, result.warnings]).toEqual([0, []]);
    });

    it('borrows up to the JTM limit and keeps the rest of the own funds', () => {
      const result = plan({ ownFunds: 30_000_000, netIncome: 400_000 });

      expect(result.paymentToIncome).toBeLessThanOrEqual(result.paymentToIncomeLimit);
      expect(result.cashKept).toBeGreaterThan(0);
      expect(result.cashKept).toBeLessThan(30_000_000);
    });
  });

  describe('stamp duty', () => {
    it('charges only the price difference when the previous home is sold', () => {
      expect(plan({ ...REPEAT_BUYER, soldHomeValue: 50_000_000 }).stampDuty).toBe(400_000);
    });

    it('waives the duty when the new home is cheaper than the sold one', () => {
      expect(plan({ ...REPEAT_BUYER, soldHomeValue: 70_000_000 }).stampDuty).toBe(0);
    });

    it('takes the home swap over the new-home relief when it is cheaper', () => {
      const result = plan({
        ...REPEAT_BUYER,
        propertyCondition: 'NEW',
        propertyPrice: 25_000_000,
        soldHomeValue: 20_000_000
      });

      expect(result.stampDuty).toBe(200_000);
    });

    it('charges 4% on a used home without CSOK', () => {
      expect(plan({}).stampDuty).toBe(2_400_000);
    });

    it('waives the duty on a new home up to 15M', () => {
      expect(plan({ propertyCondition: 'NEW', propertyPrice: 15_000_000 }).stampDuty).toBe(0);
    });

    it('charges a new home of 30M only above 15M', () => {
      expect(plan({ propertyCondition: 'NEW', propertyPrice: 30_000_000 }).stampDuty).toBe(600_000);
    });

    it('charges the full duty on a new home above 30M', () => {
      expect(plan({ propertyCondition: 'NEW', propertyPrice: 30_100_000 }).stampDuty).toBe(
        1_204_000
      );
    });

    it('halves the duty on a first home of 15M bought under 35', () => {
      expect(plan({ propertyPrice: 15_000_000 }).stampDuty).toBe(300_000);
    });

    it('charges the full duty on a first home bought at 35', () => {
      expect(plan({ propertyPrice: 15_000_000, applicantAge: 35 }).stampDuty).toBe(600_000);
    });

    it('charges the full duty on a first home above 15M', () => {
      expect(plan({ propertyPrice: 15_100_000 }).stampDuty).toBe(604_000);
    });

    it('waives the duty with Falusi CSOK', () => {
      const result = plan({
        relationship: 'MARRIED',
        settlementType: 'VILLAGE',
        propertyType: 'HOUSE',
        propertySize: 100,
        childrenBirthMonths: ['2020-01']
      });

      expect(result.stampDuty).toBe(0);
    });

    it('charges the duty when the exempting CSOK Plusz is not actually taken', () => {
      const result = plan(
        { relationship: 'MARRIED', plannedChildrenMonths: ['2027-09'], ownFunds: 70_000_000 },
        SPEND_OWN_FUNDS
      );

      expect([result.loans, result.stampDuty]).toEqual([[], 2_400_000]);
    });
  });

  describe('children', () => {
    const OTTHON_START_ONLY: Partial<HouseholdInput> = {
      relationship: 'MARRIED',
      childrenBirthMonths: ['2024-01'],
      plannedChildrenMonths: ['2027-03'],
      excludedPrograms: ['CSOK_PLUSZ', 'BABAVARO']
    };

    const otthonStartForgiven = (overrides: Partial<HouseholdInput>): number | undefined => {
      return findLoan(plan(overrides), 'OTTHON_START')?.totalForgiven;
    };

    it('forgives 10M on CSOK Plusz for the second child born after the contract', () => {
      const result = plan({
        relationship: 'MARRIED',
        plannedChildrenMonths: ['2027-09', '2030-03'],
        applicantAge: 36
      });

      expect(findLoan(result, 'CSOK_PLUSZ')?.totalForgiven).toBe(10_000_000);
    });

    it('gives the first child after the contract jelzáloghitel-elengedés, not the CSOK Plusz 10M', () => {
      const result = plan({
        relationship: 'MARRIED',
        childrenBirthMonths: ['2024-01'],
        plannedChildrenMonths: ['2028-01'],
        applicantAge: 36
      });

      expect(sum(result.loans.map((loan) => loan.totalForgiven))).toBe(1_000_000);
    });

    it('gives each child one benefit, the CSOK Plusz 10M or jelzáloghitel-elengedés', () => {
      const result = plan({
        relationship: 'MARRIED',
        childrenBirthMonths: ['2024-01'],
        plannedChildrenMonths: ['2028-01', '2030-01'],
        applicantAge: 36
      });

      expect(sum(result.loans.map((loan) => loan.totalForgiven))).toBe(11_000_000);
    });

    it('does not double count mortgage forgiveness next to CSOK Plusz', () => {
      expect(findLoan(plan(YOUNG_FAMILY), 'OTTHON_START')?.totalForgiven).toBe(0);
    });

    it('gives no jelzáloghitel-elengedés for the first child', () => {
      expect(otthonStartForgiven({ plannedChildrenMonths: ['2028-01'] })).toBe(0);
    });

    it('applies 1M jelzáloghitel-elengedés for the second child', () => {
      const forgiven = otthonStartForgiven({
        childrenBirthMonths: ['2024-01'],
        plannedChildrenMonths: ['2028-01']
      });

      expect(forgiven).toBe(1_000_000);
    });

    it('applies 4M jelzáloghitel-elengedés for the third child', () => {
      const forgiven = otthonStartForgiven({
        childrenBirthMonths: ['2022-01', '2024-01'],
        plannedChildrenMonths: ['2028-01']
      });

      expect(forgiven).toBe(4_000_000);
    });

    it('applies 1M jelzáloghitel-elengedés for the fourth child', () => {
      const forgiven = otthonStartForgiven({
        childrenBirthMonths: ['2020-01', '2022-01', '2024-01'],
        plannedChildrenMonths: ['2028-01']
      });

      expect(forgiven).toBe(1_000_000);
    });

    it('adds up jelzáloghitel-elengedés for the second and third child', () => {
      const forgiven = otthonStartForgiven({
        childrenBirthMonths: ['2024-01'],
        plannedChildrenMonths: ['2028-01', '2030-01']
      });

      expect(forgiven).toBe(5_000_000);
    });

    it('applies jelzáloghitel-elengedés for a child already on the way at signing', () => {
      expect(otthonStartForgiven({ ...OTTHON_START_ONLY, pregnant: true })).toBe(1_000_000);
    });

    it('applies jelzáloghitel-elengedés for a child conceived after signing', () => {
      expect(otthonStartForgiven(OTTHON_START_ONLY)).toBe(1_000_000);
    });

    it('adds the Falusi CSOK 1M for a child the grant did not count', () => {
      const partners: Partial<HouseholdInput> = {
        relationship: 'PARTNERS',
        childrenBirthMonths: ['2022-01', '2024-01'],
        plannedChildrenMonths: ['2028-01'],
        propertySize: 80
      };
      const forgiven = (overrides: Partial<HouseholdInput>) => {
        return sum(plan({ ...partners, ...overrides }).loans.map((loan) => loan.totalForgiven));
      };

      expect(forgiven({ settlementType: 'VILLAGE' })).toBe(5_000_000);
      expect(forgiven({ settlementType: 'CITY' })).toBe(4_000_000);
    });

    it('takes Babaváró without a child only to fit the JTM limit, and warns about the penalty', () => {
      const result = plan(
        {
          relationship: 'MARRIED',
          propertyPrice: 80_000_000,
          propertySize: 95,
          propertyType: 'HOUSE',
          propertyCondition: 'NEW',
          energyEfficient: true,
          ownFunds: 34_000_000,
          netIncome: 669_000,
          termYears: 10
        },
        DEFAULT_SETTINGS
      );

      expect(findLoan(result, 'BABAVARO')).toBeDefined();
      expect(
        result.warnings.some((warning) => warning.startsWith('Gyermek nélkül a Babaváró'))
      ).toBe(true);
    });

    it('skips Babaváró when no child comes within 5 years', () => {
      const result = plan({ relationship: 'MARRIED', plannedChildrenMonths: ['2032-06'] });

      expect(findLoan(result, 'BABAVARO')).toBeUndefined();
    });

    it('forgives 30% of the remaining Babaváró at the second child', () => {
      const result = plan({
        relationship: 'MARRIED',
        plannedChildrenMonths: ['2027-09', '2029-09']
      });

      expect(Math.round(findLoan(result, 'BABAVARO')?.totalForgiven ?? 0)).toBe(3_168_986);
    });

    it('forgives the rest of Babaváró at the third child', () => {
      const result = plan({
        relationship: 'MARRIED',
        plannedChildrenMonths: ['2027-09', '2029-09', '2031-09']
      });

      expect(Math.round(findLoan(result, 'BABAVARO')?.totalForgiven ?? 0)).toBe(10_563_288);
    });

    it('does not restart Babaváró after it is forgiven in full', () => {
      const result = plan({
        relationship: 'MARRIED',
        plannedChildrenMonths: ['2027-09', '2029-09', '2031-09']
      });

      expect(scheduleMonths(result, 'Babaváró')).toEqual([10, 34, 34, 58]);
    });

    it('takes the optional pauses at the first child when the loans are cheaper than bonds', () => {
      const result = plan({ relationship: 'MARRIED', plannedChildrenMonths: ['2027-09'] });

      // Babaváró pauses at the birth, CSOK Plusz only after its interest only first year.
      expect(
        result.schedule.timeline.filter((entry) => entry.optional).map((entry) => entry.month)
      ).toEqual([10, 12]);
    });

    it('skips optional pauses that bring no gain', () => {
      const result = plan(
        { relationship: 'MARRIED', plannedChildrenMonths: ['2027-09'] },
        { ...SETTINGS, bondYield: 0 }
      );

      expect(result.schedule.timeline.some((entry) => entry.optional)).toBe(false);
    });

    it('restarts Babaváró 3 years after the first child', () => {
      const result = plan({ relationship: 'MARRIED', plannedChildrenMonths: ['2027-09'] });

      expect(scheduleMonths(result, 'Babaváró')).toEqual([10, 46]);
    });

    it('ignores blank and past planned-child rows', () => {
      const result = plan({ relationship: 'MARRIED', plannedChildrenMonths: ['', '2020-01'] });

      expect(result.eligibility.find((item) => item.program === 'CSOK_PLUSZ')?.eligible).toBe(
        false
      );
    });

    it('counts planned children by date, not entry order', () => {
      const sorted = plan({ ...YOUNG_FAMILY, plannedChildrenMonths: ['2027-11', '2031-11'] });
      const reversed = plan({ ...YOUNG_FAMILY, plannedChildrenMonths: ['2031-11', '2027-11'] });

      expect(reversed.eligibility).toEqual(sorted.eligibility);
    });
  });

  describe('timeline', () => {
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

    it('merges same-month events of one loan into one item', () => {
      const result = plan({
        relationship: 'MARRIED',
        plannedChildrenMonths: ['2027-09', '2029-09']
      });
      const items = result.timeline.find((entry) => entry.month === '2029-09')?.items ?? [];

      expect(items.filter((item) => item.title.startsWith('Babaváró'))).toHaveLength(1);
    });
  });

  describe('Falusi CSOK', () => {
    const VILLAGE: Partial<HouseholdInput> = {
      ...YOUNG_FAMILY,
      settlementType: 'VILLAGE',
      propertySize: 80
    };

    it('adds the grant in a village', () => {
      const result = plan({
        relationship: 'MARRIED',
        settlementType: 'VILLAGE',
        propertyType: 'HOUSE',
        propertySize: 100,
        childrenBirthMonths: ['2020-01', '2022-01', '2024-01']
      });

      expect(result.grant).toBe(7_500_000);
    });

    it('puts the modernization part of a used home grant toward the renovation', () => {
      expect(plan({ ...VILLAGE, renovationBudget: 3_000_000 }).grant).toBeGreaterThan(
        plan(VILLAGE).grant
      );
    });
  });

  describe('own funds', () => {
    it('needs no loan when own funds cover the price and keeping them is off', () => {
      expect(plan({ ownFunds: 60_000_000 }, SPEND_OWN_FUNDS).loans).toEqual([]);
    });

    it('borrows the cheap loan and keeps own funds when bonds earn more', () => {
      const result = plan({ ownFunds: 60_000_000 });

      expect([result.ownFundsUsed, result.cashKept]).toEqual([10_000_000, 50_000_000]);
    });

    it('spends own funds when bonds earn less than the loans cost', () => {
      const result = plan({ ownFunds: 60_000_000 }, { ...SETTINGS, bondYield: 0.01 });

      expect([result.loans, result.ownFundsUsed]).toEqual([[], 60_000_000]);
    });

    it('reports how much of the own funds it spends', () => {
      const result = plan({ ownFunds: 30_000_000, netIncome: 400_000 });

      expect(result.ownFundsUsed + result.cashKept).toBe(30_000_000);
    });

    it('averages the compounded bond return of the kept cash over the term', () => {
      const total = 50_000_000 * (1.0548 ** 25 - 1);

      expect(plan({ ownFunds: 60_000_000 }).investmentReturn.monthlyAverage).toBeCloseTo(
        total / 300,
        0
      );
    });

    it('starts the investment return at the first year interest', () => {
      expect(plan({ ownFunds: 60_000_000 }).investmentReturn.initialMonthly).toBeCloseTo(
        (50_000_000 * 0.0548) / 12,
        0
      );
    });

    it('never lets a single buyer borrow the down payment', () => {
      expect(plan({ ownFunds: 30_000_000 }).ownFundsUsed).toBeGreaterThanOrEqual(6_000_000);
    });

    it('requires own funds for the down payment when Babaváró does not count', () => {
      const result = plan(
        { ...YOUNG_FAMILY, propertyPrice: 60_000_000, ownFunds: 0 },
        { ...SETTINGS, babavaroAsDownPayment: false }
      );

      expect(result.warnings.some((warning) => warning.includes('saját önerő szükséges'))).toBe(
        true
      );
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
  });

  describe('renovation', () => {
    const RENOVATION: Partial<HouseholdInput> = {
      propertyPrice: 50_000_000,
      ownFunds: 5_000_000,
      renovationBudget: 10_000_000
    };

    it('pays renovation from own funds, never from Otthon Start', () => {
      const result = plan({ ...RENOVATION, ownFunds: 15_000_000 }, SPEND_OWN_FUNDS);

      expect(loanAmounts(result)).toEqual([['OTTHON_START', 45_000_000]]);
    });

    it('warns when the renovation cannot be financed', () => {
      expect(plan(RENOVATION, SPEND_OWN_FUNDS).warnings).toContain(
        'A hitelek és az önerő nem fedezik a vételárat és a felújítást'
      );
    });

    it('pays renovation from Babaváró', () => {
      const result = plan(
        { ...RENOVATION, relationship: 'MARRIED', plannedChildrenMonths: ['2027-09'] },
        SPEND_OWN_FUNDS
      );

      expect(loanAmounts(result)).toEqual([
        ['BABAVARO', 11_000_000],
        ['CSOK_PLUSZ', 15_000_000],
        ['OTTHON_START', 29_000_000]
      ]);
    });

    it('covers renovation and price together with Babaváró', () => {
      const result = plan(
        { ...RENOVATION, relationship: 'MARRIED', plannedChildrenMonths: ['2027-09'] },
        SPEND_OWN_FUNDS
      );

      expect(isUncovered(result)).toBe(false);
    });
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

      expect([babavaro?.amount, babavaro?.use, babavaro?.target]).toEqual([
        11_000_000,
        'PREPAY',
        'Test Bank Fix 10'
      ]);
    });

    it('invests the later Babaváró when every loan is cheaper than bonds', () => {
      const result = plan({ ...ENGAGED, propertyPrice: 50_000_000, ownFunds: 10_000_000 });

      expect(result.marriage?.babavaro?.use).toBe('INVEST');
    });

    it('offers no later Babaváró when the wife turns 35 by the wedding', () => {
      expect(plan({ ...ENGAGED, applicantAge: 34 }).marriage?.babavaro).toBeUndefined();
    });

    it('compares buying only after the wedding', () => {
      expect(plan(ENGAGED).marriage?.buyAfter.loans).toEqual([
        'CSOK Plusz',
        'Otthon Start (Test Bank)',
        'Babaváró'
      ]);
    });

    it('ignores the wedding for married couples', () => {
      expect(plan({ ...ENGAGED, relationship: 'MARRIED' }).marriage).toBeUndefined();
    });

    it('ignores a wedding before the start', () => {
      expect(plan({ ...ENGAGED, plannedMarriageMonth: '2026-10' }).marriage).toBeUndefined();
    });

    it('has no outlook without a planned wedding', () => {
      expect(plan({}).marriage).toBeUndefined();
    });
  });

  describe('money balance', () => {
    const CASES: [string, Partial<HouseholdInput>, PlanSettings][] = [
      ['single, city, used', {}, SETTINGS],
      ['young family, keeping own funds', YOUNG_FAMILY, SETTINGS],
      ['young family, spending own funds', YOUNG_FAMILY, SPEND_OWN_FUNDS],
      [
        'village, used house, renovation',
        {
          ...YOUNG_FAMILY,
          settlementType: 'VILLAGE',
          propertyType: 'HOUSE',
          propertySize: 100,
          renovationBudget: 3_000_000
        },
        SETTINGS
      ],
      [
        'village, new house, three children',
        {
          relationship: 'MARRIED',
          settlementType: 'VILLAGE',
          propertyCondition: 'NEW',
          propertyType: 'HOUSE',
          propertySize: 100,
          childrenBirthMonths: ['2020-01', '2022-01', '2024-01']
        },
        SPEND_OWN_FUNDS
      ],
      ['single, new home', { propertyCondition: 'NEW', propertyPrice: 30_000_000 }, SETTINGS],
      [
        'repeat buyer, renovation',
        { firstHome: false, ownFunds: 30_000_000, renovationBudget: 5_000_000 },
        SPEND_OWN_FUNDS
      ],
      [
        'married, renovation, keeping own funds',
        {
          relationship: 'MARRIED',
          plannedChildrenMonths: ['2027-09'],
          ownFunds: 20_000_000,
          renovationBudget: 8_000_000
        },
        SETTINGS
      ]
    ];

    it.each(CASES)('pays exactly price plus renovation: %s', (_, overrides, settings) => {
      const input = household(overrides);
      const result = buildPlan(input, settings);
      const borrowed = result.loans.reduce((total, loan) => total + loan.amount, 0);
      const keptLoanMoney = result.cashKept - (input.ownFunds - result.ownFundsUsed);

      expect(isUncovered(result)).toBe(false);
      expect(borrowed + result.ownFundsUsed + result.grant - keptLoanMoney).toBeCloseTo(
        input.propertyPrice + input.renovationBudget,
        0
      );
    });

    it.each(CASES)(
      'keeps mortgages within the loan-to-value limit: %s',
      (_, overrides, settings) => {
        const input = household(overrides);
        const mortgages = buildPlan(input, settings)
          .loans.filter((loan) => loan.id !== 'BABAVARO')
          .reduce((total, loan) => total + loan.amount, 0);

        expect(mortgages).toBeLessThanOrEqual(input.propertyPrice * (input.firstHome ? 0.9 : 0.8));
      }
    );
  });
});
