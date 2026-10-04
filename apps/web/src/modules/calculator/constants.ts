import type { HouseholdInput } from '@hitel/core/eligibility';
import { nextMonth } from '@/utils/date';

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
  startMonth: nextMonth()
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

export const MIN_TERM_YEARS = 5;
export const MAX_TERM_YEARS = 35;
