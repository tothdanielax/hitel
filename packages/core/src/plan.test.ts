import { describe, expect, it } from 'vite-plus/test';
import type { Bank } from './banks/bank';
import type { HouseholdInput } from './eligibility';
import { buildPlan } from './plan';

const BANK: Bank = {
  id: 'test',
  name: 'Test Bank',
  api: null,
  developerPortal: '',
  offers: [
    {
      product: 'Fix 10',
      kind: 'MARKET',
      annualRate: 0.06,
      fixationYears: 10,
      asOf: '2026-10-04',
      source: ''
    }
  ]
};

const household = (overrides: Partial<HouseholdInput>): HouseholdInput => {
  return {
    relationship: 'SINGLE',
    applicantAge: 30,
    partnerAge: 30,
    insuredYears: 5,
    firstHome: true,
    cleanRecord: true,
    pregnant: false,
    childrenBirthMonths: [],
    plannedChildrenMonths: [],
    propertyPrice: 60_000_000,
    propertySize: 60,
    propertyType: 'APARTMENT',
    propertyCondition: 'USED',
    settlementType: 'CITY',
    ownFunds: 10_000_000,
    netIncome: 1_500_000,
    termYears: 25,
    startMonth: '2026-11',
    ...overrides
  };
};

const loanIds = (input: HouseholdInput): string[] => {
  return buildPlan(input, [BANK]).loans.map((loan) => loan.id);
};

describe('buildPlan', () => {
  it('finances a single first-time buyer with Otthon Start only', () => {
    const plan = buildPlan(household({}), [BANK]);

    expect(plan.loans.map((loan) => loan.id)).toEqual(['OTTHON_START']);
    expect(plan.loans[0]?.amount).toBe(50_000_000);
    expect(Math.round(plan.schedule.initialMonthly)).toBe(237_106);
    expect(plan.warnings).toEqual([]);
  });

  it('tops up with a bank loan above the Otthon Start cap', () => {
    const plan = buildPlan(household({ propertyPrice: 80_000_000, propertySize: 80 }), [BANK]);

    expect(plan.loans.map((loan) => loan.amount)).toEqual([50_000_000, 20_000_000]);
    expect(
      plan.timeline.some((entry) => entry.titles.some((title) => title.includes('átárazás')))
    ).toBe(true);
  });

  it('uses only the bank when Otthon Start is not available (not a first home)', () => {
    const plan = buildPlan(household({ firstHome: false }), [BANK]);

    expect(plan.loans.map((loan) => loan.id)).toEqual(['bank-test']);
    expect(plan.loans[0]?.amount).toBe(48_000_000);
    expect(plan.shortfall).toBe(2_000_000);
  });

  it('combines Babaváró, CSOK Plusz and Otthon Start for a young married couple planning children', () => {
    const ids = loanIds(
      household({
        relationship: 'MARRIED',
        propertyPrice: 90_000_000,
        propertySize: 70,
        plannedChildrenMonths: ['2027-09', '2030-03']
      })
    );

    expect(ids).toEqual(['BABAVARO', 'CSOK_PLUSZ', 'OTTHON_START']);
  });

  it('forgives 10M on CSOK Plusz for the second child', () => {
    const plan = buildPlan(
      household({
        relationship: 'MARRIED',
        childrenBirthMonths: ['2024-01'],
        plannedChildrenMonths: ['2028-01'],
        applicantAge: 36
      }),
      [BANK]
    );
    const csokPlusz = plan.loans.find((loan) => loan.id === 'CSOK_PLUSZ');

    expect(csokPlusz?.amount).toBe(30_000_000);
    expect(csokPlusz?.totalForgiven).toBe(10_000_000);
  });

  it('applies jelzáloghitel-elengedés on Otthon Start for the second child', () => {
    const plan = buildPlan(
      household({ childrenBirthMonths: ['2024-01'], plannedChildrenMonths: ['2028-01'] }),
      [BANK]
    );

    expect(plan.loans.find((loan) => loan.id === 'OTTHON_START')?.totalForgiven).toBe(1_000_000);
  });

  it('adds the Falusi CSOK grant in a village and waives stamp duty', () => {
    const plan = buildPlan(
      household({
        relationship: 'MARRIED',
        settlementType: 'VILLAGE',
        propertyCondition: 'NEW',
        propertyType: 'HOUSE',
        propertySize: 100,
        childrenBirthMonths: ['2020-01', '2022-01', '2024-01']
      }),
      [BANK]
    );

    expect(plan.grant).toBe(15_000_000);
    expect(plan.stampDuty).toBe(0);
  });

  it('charges 4% stamp duty on a used home without CSOK', () => {
    expect(buildPlan(household({}), [BANK]).stampDuty).toBe(2_400_000);
  });

  it('never combines CSOK Plusz with Falusi CSOK-kölcsön', () => {
    const ids = loanIds(
      household({
        relationship: 'MARRIED',
        settlementType: 'VILLAGE',
        propertyType: 'HOUSE',
        propertySize: 100,
        propertyPrice: 120_000_000,
        ownFunds: 20_000_000,
        firstHome: false,
        childrenBirthMonths: ['2020-01', '2022-01'],
        plannedChildrenMonths: ['2028-01']
      })
    );

    expect(ids.includes('CSOK_PLUSZ') && ids.includes('FALUSI_CSOK_LOAN')).toBe(false);
  });

  it('groups same-month events into one timeline entry', () => {
    const plan = buildPlan(
      household({
        relationship: 'MARRIED',
        childrenBirthMonths: ['2024-01'],
        plannedChildrenMonths: ['2028-01'],
        propertyPrice: 90_000_000,
        propertySize: 70
      }),
      [BANK]
    );
    const birth = plan.timeline.find((entry) => entry.month === '2028-01');

    expect(birth?.titles.length).toBeGreaterThan(1);
    expect(new Set(plan.timeline.map((entry) => entry.month)).size).toBe(plan.timeline.length);
  });

  it('warns when installments exceed the JTM limit', () => {
    const plan = buildPlan(household({ netIncome: 300_000 }), [BANK]);

    expect(plan.warnings).toContain(
      'A törlesztőrészlet meghaladja a jövedelemarányos (JTM) korlátot'
    );
  });

  it('needs no loan when own funds cover the price', () => {
    const plan = buildPlan(household({ ownFunds: 60_000_000 }), [BANK]);

    expect(plan.loans).toEqual([]);
    expect(plan.schedule.totalPaid).toBe(0);
  });
});
