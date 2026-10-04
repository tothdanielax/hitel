// Source of truth: docs/gov-loans.md (status 2026-10-04). Re-check Magyar Közlöny before changing.

export const RULES_AS_OF = '2026-10-04';

export const GOV_PROGRAM = {
  OTTHON_START: 'OTTHON_START',
  CSOK_PLUSZ: 'CSOK_PLUSZ',
  BABAVARO: 'BABAVARO',
  FALUSI_CSOK: 'FALUSI_CSOK',
  FALUSI_CSOK_LOAN: 'FALUSI_CSOK_LOAN',
  MORTGAGE_FORGIVENESS: 'MORTGAGE_FORGIVENESS'
} as const;
export type GovProgram = keyof typeof GOV_PROGRAM;

const PROPERTY_TYPE = {
  APARTMENT: 'APARTMENT',
  HOUSE: 'HOUSE'
} as const;
export type PropertyType = keyof typeof PROPERTY_TYPE;

export const OTTHON_START = {
  name: 'Otthon Start',
  legalBasis: '227/2025. (VII. 31.) Korm. rendelet',
  maxAmount: 50_000_000,
  annualRate: 0.03,
  maxTermYears: 25,
  minDownPaymentRate: 0.1,
  maxPropertyValue: { APARTMENT: 100_000_000, HOUSE: 150_000_000 },
  maxPricePerSqm: 1_500_000,
  minAge: 18,
  minInsuredYears: 2,
  priorOwnershipLookbackYears: 10,
  priorOwnershipMaxShare: 0.5,
  priorPropertyIgnoredBelow: 15_000_000,
  requiresMarriage: false,
  requiresCleanRecord: true
} as const;

// Max amount and minimum floor area are indexed by children count (existing + promised), capped at 3.
export const CSOK_PLUSZ = {
  name: 'CSOK Plusz',
  legalBasis: '518/2023. (XI. 30.) Korm. rendelet',
  maxAmountByChildren: [0, 15_000_000, 30_000_000, 50_000_000],
  annualRate: 0.03,
  minTermYears: 10,
  maxTermYears: 25,
  wifeAgeBelow: 41,
  minInsuredYears: 2,
  minNewChildren: 1,
  maxPropertyValue: {
    FIRST_HOME: { APARTMENT: 100_000_000, HOUSE: 150_000_000 },
    OTHER: { APARTMENT: 150_000_000, HOUSE: 150_000_000 }
  },
  minFloorAreaByChildren: {
    APARTMENT: [0, 40, 50, 60],
    HOUSE: [0, 70, 80, 90]
  },
  childDeadlineYearsByPromised: [0, 4, 8, 10],
  firstChildSuspensionMonths: 12,
  forgivenessPerChild: 10_000_000,
  // Child order counts all children; only births after the contract qualify.
  forgivenessFromChildOrder: 2,
  requiresMarriage: true,
  requiresCleanRecord: true
} as const;

export const BABAVARO = {
  name: 'Babaváró',
  legalBasis: '44/2019. (III. 12.) Korm. rendelet',
  maxAmount: 11_000_000,
  annualRate: 0,
  maxMonthlyPayment: 51_000,
  minTermYears: 5,
  maxTermYears: 20,
  wifeMinAge: 18,
  wifeAgeBelow: 35,
  minInsuredYears: 3,
  firstChildDeadlineYears: 5,
  suspensionMonthsPerChild: 36,
  // Child order counts only children born after disbursement.
  suspendingChildren: [1, 2],
  forgivenessRateByChild: { 2: 0.3, 3: 1 },
  requiresMarriage: true,
  requiresCleanRecord: true
} as const;

export const FALUSI_CSOK = {
  name: 'Falusi CSOK',
  legalBasis: '302/2023. (VII. 11.) Korm. rendelet',
  grantByChildren: [0, 1_000_000, 4_000_000, 15_000_000],
  modernizationOnlyGrantByChildren: [0, 600_000, 2_000_000, 7_500_000],
  usedPurchaseMaxShareForPrice: 0.5,
  wifeAgeBelow: 41,
  minInsuredYears: 2,
  minFloorAreaByChildren: CSOK_PLUSZ.minFloorAreaByChildren,
  requiresMarriage: true,
  requiresCleanRecord: true
} as const;

export const FALUSI_CSOK_LOAN = {
  name: 'Falusi CSOK-kölcsön',
  legalBasis: '302/2023. (VII. 11.) Korm. rendelet',
  maxAmountByChildren: [0, 0, 10_000_000, 15_000_000],
  annualRate: 0.03,
  maxTermYears: 25,
  requiresMarriage: true,
  requiresCleanRecord: true
} as const;

// Applies to housing mortgages contracted before the birth, never to Babaváró.
export const MORTGAGE_FORGIVENESS = {
  name: 'Jelzáloghitel-elengedés',
  legalBasis: '337/2017. (XI. 14.) Korm. rendelet',
  amountByChildOrder: { 2: 1_000_000, 3: 4_000_000 },
  amountForFurtherChild: 1_000_000
} as const;

export const MNB_LIMITS = {
  legalBasis: '32/2014. (IX. 10.) MNB rendelet',
  incomeThreshold: 800_000,
  // [below threshold, at or above threshold]
  paymentToIncomeByFixation: {
    UNDER_5_YEARS: [0.25, 0.3],
    FROM_5_TO_10_YEARS: [0.35, 0.4],
    FROM_10_YEARS: [0.5, 0.6]
  },
  loanToValue: 0.8,
  firstBuyerLoanToValue: 0.9
} as const;

export const STAMP_DUTY = {
  legalBasis: '1990. évi XCIII. törvény',
  rate: 0.04,
  newHomeExemptUpTo: 15_000_000,
  newHomeExemptionMaxValue: 30_000_000,
  exemptWith: [GOV_PROGRAM.CSOK_PLUSZ, GOV_PROGRAM.FALUSI_CSOK]
} as const;

// Pairs that cannot be used together. Unclear pairs from docs/gov-loans.md are treated as not allowed.
export const INCOMPATIBLE_PROGRAMS: readonly (readonly [GovProgram, GovProgram])[] = [
  [GOV_PROGRAM.CSOK_PLUSZ, GOV_PROGRAM.FALUSI_CSOK_LOAN],
  [GOV_PROGRAM.OTTHON_START, GOV_PROGRAM.FALUSI_CSOK_LOAN]
];

// Market rate after a bank loan's fixation ends: ECB MIR, HU new housing loans, all fixations, Aug 2026.
export const MARKET_REPRICE_RATE = 0.0715;

export const MAX_COUNTED_CHILDREN = 3;

export const TERM_YEARS = { min: 5, max: 35 } as const;

// MÁP Plusz 2031/M6 average yield (5.00-6.00%, tax free), allampapirkalkulator.hu, 2026-10.
export const DEFAULT_BOND_YIELD = 0.0548;

// MNB long-term inflation target from 2028 (Inflációs jelentés 2026 szeptember).
export const DEFAULT_INFLATION_RATE = 0.025;
