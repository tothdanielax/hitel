import { DEFAULT_BOND_YIELD, DEFAULT_INFLATION_RATE } from '@hitel/core/constants';
import type { HouseholdInput } from '@hitel/core/eligibility';
import { addMonths } from '@hitel/core/months';

export const BUILD_MONTH: string = import.meta.env.VITE_BUILD_MONTH;

export const DEFAULT_HOUSEHOLD: HouseholdInput = {
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
  ownFunds: 10_000_000,
  netIncome: 1_200_000,
  termYears: 25,
  startMonth: addMonths(BUILD_MONTH, 1),
  bondYield: DEFAULT_BOND_YIELD,
  inflationRate: DEFAULT_INFLATION_RATE
};

export const RELATIONSHIP_OPTIONS = {
  SINGLE: 'Egyedülálló',
  MARRIED: 'Házaspár',
  PARTNERS: 'Élettársak'
} as const;

export const PROPERTY_TYPE_OPTIONS = {
  APARTMENT: 'Lakás',
  HOUSE: 'Családi ház'
} as const;

export const PROPERTY_CONDITION_OPTIONS = {
  NEW: 'Új építésű',
  USED: 'Használt'
} as const;

export const SETTLEMENT_OPTIONS = {
  BUDAPEST: 'Budapest',
  CITY: 'Város',
  VILLAGE: 'Falusi CSOK település'
} as const;

export const PROGRAM_NAMES = {
  OTTHON_START: 'Otthon Start',
  CSOK_PLUSZ: 'CSOK Plusz',
  BABAVARO: 'Babaváró',
  FALUSI_CSOK: 'Falusi CSOK',
  FALUSI_CSOK_LOAN: 'Falusi CSOK-kölcsön',
  MORTGAGE_FORGIVENESS: 'Jelzáloghitel-elengedés'
} as const;

export const INPUT_LIMITS = {
  age: { min: 16, max: 99 },
  insuredYears: { min: 0, max: 60 },
  money: { min: 0, max: 2_000_000_000 },
  propertySize: { min: 1, max: 2_000 },
  netIncome: { min: 0, max: 100_000_000 },
  rate: { min: 0, max: 0.3 }
} as const;
