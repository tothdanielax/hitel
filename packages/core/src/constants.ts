// Every rule number lives here, research and sources: docs/gov-loans.md.
// Re-check Magyar Közlöny before changing.

export const RULES_AS_OF = '2026-10-13';

export const GOV_PROGRAM = {
  OTTHON_START: 'OTTHON_START',
  CSOK_PLUSZ: 'CSOK_PLUSZ',
  BABAVARO: 'BABAVARO',
  FALUSI_CSOK: 'FALUSI_CSOK',
  FALUSI_CSOK_LOAN: 'FALUSI_CSOK_LOAN',
  MORTGAGE_FORGIVENESS: 'MORTGAGE_FORGIVENESS'
} as const;
export type GovProgram = keyof typeof GOV_PROGRAM;

export type PropertyType = 'APARTMENT' | 'HOUSE';

export const MONTHS_PER_YEAR = 12;
export const MILLION = 1_000_000;

// ISO month ('YYYY-MM') as produced by <input type="month">.
export const ISO_MONTH_LENGTH = 7;
export const ISO_MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

// Loan amounts the planner searches are rounded to this.
export const AMOUNT_SEARCH_STEP = 100_000;

// Remaining balance treated as fully repaid, absorbs floating point rounding.
export const BALANCE_EPSILON = 0.5;

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
  // Government review in progress, tighter rules expected for contracts from 2027 (nothing published yet).
  reviewFrom: '2027-01',
  requiresMarriage: false,
  requiresCleanRecord: true
} as const;

// Max amount and minimum floor area are indexed by children count (existing + promised), capped at 3.
export const CSOK_PLUSZ = {
  name: 'CSOK Plusz',
  legalBasis: '518/2023. (XI. 30.) Korm. rendelet',
  maxAmountByChildren: [0, 15_000_000, 30_000_000, 50_000_000],
  // The decree sets none: OTP's 500k is the lowest bank minimum.
  minAmount: 500_000,
  annualRate: 0.03,
  // 12. § (2): principal is repaid from the 13th month, the first year is interest only.
  interestOnlyMonths: 12,
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
  // 46. § (1): the order counts only children born after the application.
  forgivenessFromChildOrder: 2,
  requiresMarriage: true,
  requiresCleanRecord: true
} as const;

export const BABAVARO = {
  name: 'Babaváró',
  legalBasis: '44/2019. (III. 12.) Korm. rendelet',
  maxAmount: 11_000_000,
  annualRate: 0,
  // 18. §: 0.5% a year guarantee fee on the balance, part of the 51k cap, not charged during a pause.
  guaranteeFeeRate: 0.005,
  maxMonthlyPayment: 51_000,
  minTermYears: 5,
  maxTermYears: 20,
  wifeMinAge: 18,
  wifeAgeBelow: 35,
  minInsuredYears: 3,
  firstChildDeadlineYears: 5,
  // 15. § (10): no child in time, the rate rises to at most ÁKK 5 year yield x 130% + 4 pp
  // (5.28% for Oct 2026, OTP), and 15. § (1) charges alapkamat + 3 pp on the amount for the period.
  noChildRate: 0.1086,
  noChildChargeOverBaseRate: 0.03,
  suspensionMonthsPerChild: 36,
  // Child order counts only children born after disbursement.
  suspendingChildren: [1, 2],
  // Share of the remaining debt forgiven, indexed by child order.
  forgivenessRateByChild: [0, 0, 0.3, 1],
  requiresMarriage: true,
  requiresCleanRecord: true
} as const;

export const FALUSI_CSOK = {
  name: 'Falusi CSOK',
  legalBasis: '302/2023. (VII. 11.) Korm. rendelet',
  grantByChildren: [0, 1_000_000, 4_000_000, 15_000_000],
  usedPurchaseMaxShareForPrice: 0.5,
  // 23. §: each child born later and not counted in the grant prepays a housing loan with 1M.
  laterChildBonus: 1_000_000,
  wifeAgeBelow: 41,
  minInsuredYears: 2,
  minFloorAreaByChildren: CSOK_PLUSZ.minFloorAreaByChildren,
  // 2. § (2), 11. § (3): partners and single parents too, but promised children count only for a married couple.
  requiresMarriage: false,
  requiresCleanRecord: true
} as const;

export const FALUSI_CSOK_LOAN = {
  name: 'Falusi CSOK-kölcsön',
  legalBasis: '302/2023. (VII. 11.) Korm. rendelet',
  maxAmountByChildren: [0, 0, 10_000_000, 15_000_000],
  annualRate: 0.03,
  maxTermYears: 25,
  // 53. §: follows the grant (2 or more children), so whoever gets that grant.
  requiresMarriage: false,
  requiresCleanRecord: true
} as const;

// 337/2017.: any housing mortgage applied for before the birth (CSOK Plusz too), never Babaváró. One
// benefit per child: a child that gets the CSOK Plusz 10M forgiveness gets nothing here.
export const MORTGAGE_FORGIVENESS = {
  name: 'Jelzáloghitel-elengedés',
  legalBasis: '337/2017. (XI. 14.) Korm. rendelet',
  // Indexed by child order (all children count); later children get amountForFurtherChild.
  amountByChildOrder: [0, 0, 1_000_000, 4_000_000],
  amountForFurtherChild: 1_000_000
} as const;

export const MNB_LIMITS = {
  legalBasis: '32/2014. (IX. 10.) MNB rendelet',
  incomeThreshold: 800_000,
  fixationYears: { medium: 5, long: 10 },
  // [below threshold, at or above threshold]
  paymentToIncomeByFixation: {
    UNDER_5_YEARS: [0.25, 0.3],
    FROM_5_TO_10_YEARS: [0.35, 0.4],
    FROM_10_YEARS: [0.5, 0.6]
  },
  loanToValue: 0.8,
  firstBuyerLoanToValue: 0.9,
  // 3. § (1c), 6. § (4a): energy class A+ (at most 68 kWh/m²/year), fixed for 10+ years.
  green: { loanToValue: 0.9, paymentToIncome: 0.6 }
} as const;

export const STAMP_DUTY = {
  legalBasis: '1990. évi XCIII. törvény',
  rate: 0.04,
  newHomeExemptUpTo: 15_000_000,
  newHomeExemptionMaxValue: 30_000_000,
  // Itv. 21. § (2) b), 26. § (1) y): selling the previous home lowers the base by its value.
  // Itv. 26. § (6): up to half the duty on a first home of at most 15M bought under 35.
  youngFirstHome: { ageBelow: 35, maxValue: 15_000_000, reduction: 0.5 },
  exemptWith: [GOV_PROGRAM.CSOK_PLUSZ, GOV_PROGRAM.FALUSI_CSOK]
} as const;

export const PROGRAMS: Record<GovProgram, { name: string; legalBasis: string }> = {
  OTTHON_START,
  CSOK_PLUSZ,
  BABAVARO,
  FALUSI_CSOK,
  FALUSI_CSOK_LOAN,
  MORTGAGE_FORGIVENESS
};

// What a loan may pay for. FREE money (a personal loan) may also be kept and invested.
export type LoanPurpose = 'PURCHASE' | 'RENOVATION' | 'FREE';

export const LOAN_PURPOSES: Partial<Record<GovProgram, readonly LoanPurpose[]>> = {
  // Purchase or construction only, not renovation (227/2025. Korm. rendelet).
  OTTHON_START: ['PURCHASE'],
  // Purchase, construction, expansion; not modernization (518/2023. Korm. rendelet).
  CSOK_PLUSZ: ['PURCHASE'],
  // Not a housing loan, freely usable.
  BABAVARO: ['PURCHASE', 'RENOVATION', 'FREE'],
  // The grant's own purposes, modernization included (?).
  FALUSI_CSOK_LOAN: ['PURCHASE', 'RENOVATION']
};

// Market housing loans finance purchase and renovation alike.
export const BANK_LOAN_PURPOSES: readonly LoanPurpose[] = ['PURCHASE', 'RENOVATION'];

// Programs that are loans (the rest are grants or forgiveness).
export const LOAN_PROGRAMS: GovProgram[] = [
  GOV_PROGRAM.BABAVARO,
  GOV_PROGRAM.CSOK_PLUSZ,
  GOV_PROGRAM.OTTHON_START,
  GOV_PROGRAM.FALUSI_CSOK_LOAN
];

// Programs the user may rule out (already used once, or simply not wanted).
export const EXCLUDABLE_PROGRAMS: GovProgram[] = [
  GOV_PROGRAM.OTTHON_START,
  GOV_PROGRAM.CSOK_PLUSZ,
  GOV_PROGRAM.BABAVARO,
  GOV_PROGRAM.FALUSI_CSOK,
  GOV_PROGRAM.FALUSI_CSOK_LOAN
];

// Pairs that cannot be used together.
export const INCOMPATIBLE_PROGRAMS: readonly (readonly [GovProgram, GovProgram])[] = [
  // 302/2023. 53. § (15). Otthon Start goes with either (227/2025. 9. § (5) c)).
  [GOV_PROGRAM.CSOK_PLUSZ, GOV_PROGRAM.FALUSI_CSOK_LOAN]
];

// Early repayment fee: Otthon Start caps it at 1%, consumer mortgages at 1-2% (?).
export const PREPAYMENT_FEE_RATE = 0.01;

// Market rate after a bank loan's fixation ends: ECB MIR, HU new housing loans, all fixations, Aug 2026.
export const DEFAULT_REPRICE_RATE = 0.0715;

export const MAX_COUNTED_CHILDREN = 3;

export const TERM_YEARS = { min: 5, max: 35 } as const;

// MÁP Plusz 2031/M6 average yield (5.00-6.00%, tax free), allampapirkalkulator.hu, 2026-10.
// MNB alapkamat since 2026-08-26.
export const MNB_BASE_RATE = 0.055;

export const DEFAULT_BOND_YIELD = 0.0548;

// MNB long-term inflation target from 2028 (Inflációs jelentés 2026 szeptember).
export const DEFAULT_INFLATION_RATE = 0.025;
