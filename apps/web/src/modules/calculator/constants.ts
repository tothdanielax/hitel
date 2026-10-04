import type { HouseholdInput } from '@hitel/core/eligibility';
import { addMonths } from '@hitel/core/utils/date';
import { DEFAULT_SETTINGS, type PlanSettings } from '@hitel/core/settings';
import { MONTHS_PER_YEAR } from '@hitel/core/constants';

export const BUILD_MONTH: string = import.meta.env.VITE_BUILD_MONTH;

export type MonthRange = { from: string; to: string };

// Selectable months for the date pickers.
export const MONTH_RANGE = {
  born: { from: addMonths(BUILD_MONTH, -25 * MONTHS_PER_YEAR), to: BUILD_MONTH },
  planned: { from: BUILD_MONTH, to: addMonths(BUILD_MONTH, 15 * MONTHS_PER_YEAR) },
  start: { from: addMonths(BUILD_MONTH, 1), to: addMonths(BUILD_MONTH, 5 * MONTHS_PER_YEAR) }
} as const satisfies Record<string, MonthRange>;

export const DEFAULT_VALUES: HouseholdInput & { settings: PlanSettings } = {
  relationship: 'MARRIED',
  applicantAge: 30,
  partnerAge: 32,
  insuredYears: 5,
  firstHome: true,
  cleanRecord: true,
  pregnant: false,
  childrenBirthMonths: [],
  plannedChildrenMonths: [],
  propertyPrice: 80_000_000,
  propertySize: 70,
  propertyType: 'APARTMENT',
  propertyCondition: 'USED',
  settlementType: 'CITY',
  renovationBudget: 0,
  ownFunds: 10_000_000,
  netIncome: 1_200_000,
  termYears: 25,
  startMonth: addMonths(BUILD_MONTH, 1),
  settings: DEFAULT_SETTINGS
};

export const RELATIONSHIP_OPTIONS = {
  SINGLE: 'Egyedülálló',
  MARRIED: 'Házaspár',
  PARTNERS: 'Élettársak'
} as const satisfies Record<HouseholdInput['relationship'], string>;

export const PROPERTY_TYPE_OPTIONS = {
  APARTMENT: 'Lakás',
  HOUSE: 'Családi ház'
} as const satisfies Record<HouseholdInput['propertyType'], string>;

export const PROPERTY_CONDITION_OPTIONS = {
  NEW: 'Új építésű',
  USED: 'Használt'
} as const satisfies Record<HouseholdInput['propertyCondition'], string>;

export const SETTLEMENT_OPTIONS = {
  BUDAPEST: 'Budapest',
  CITY: 'Város',
  VILLAGE: 'Falusi CSOK település'
} as const satisfies Record<HouseholdInput['settlementType'], string>;

export const INPUT_LIMITS = {
  age: { min: 16, max: 99 },
  insuredYears: { min: 0, max: 60 },
  money: { min: 0, max: 2_000_000_000 },
  propertySize: { min: 1, max: 2_000 },
  netIncome: { min: 0, max: 100_000_000 },
  rate: { min: 0, max: 0.3 },
  fixationYears: { min: 0, max: 35 }
} as const;

export const MONEY_STEP = {
  price: 1_000_000,
  funds: 500_000,
  renovation: 500_000,
  income: 50_000
} as const;

// One tenth of a percentage point.
export const RATE_STEP = 0.001;
