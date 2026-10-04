import {
  BABAVARO,
  CSOK_PLUSZ,
  EXCLUDABLE_PROGRAMS,
  FALUSI_CSOK,
  FALUSI_CSOK_LOAN,
  GOV_PROGRAM,
  ISO_MONTH,
  MAX_COUNTED_CHILDREN,
  MONTHS_PER_YEAR,
  OTTHON_START,
  type GovProgram,
  TERM_YEARS,
  type PropertyType
} from './constants';
import { monthsBetween } from './utils/date';

type Relationship = 'SINGLE' | 'MARRIED' | 'PARTNERS';
type PropertyCondition = 'NEW' | 'USED';
type SettlementType = 'BUDAPEST' | 'CITY' | 'VILLAGE';

export type HouseholdInput = {
  relationship: Relationship;
  // For married couples this is the wife's age, the age limits of family programs apply to her.
  applicantAge: number;
  partnerAge: number;
  insuredYears: number;
  firstHome: boolean;
  cleanRecord: boolean;
  // Already used (most programs are once per person or couple) or not wanted.
  excludedPrograms: GovProgram[];
  pregnant: boolean;
  childrenBirthMonths: string[];
  plannedChildrenMonths: string[];
  propertyPrice: number;
  propertySize: number;
  propertyType: PropertyType;
  propertyCondition: PropertyCondition;
  settlementType: SettlementType;
  // Planned renovation on top of the price; only some loans may pay for it.
  renovationBudget: number;
  ownFunds: number;
  netIncome: number;
  termYears: number;
  startMonth: string;
  // Unmarried couples may plan a wedding: Babaváró and CSOK Plusz need marriage. Empty when none.
  plannedMarriageMonth: string;
};

export type Eligibility = {
  program: GovProgram;
  eligible: boolean;
  maxAmount: number;
  reasons: string[];
};

// Form rows can be blank or unordered; rules assume valid, chronological months and a sane term.
export const normalizeInput = (input: HouseholdInput): HouseholdInput => {
  const validMonths = (months: string[]): string[] => {
    return months.filter((month) => ISO_MONTH.test(month)).toSorted();
  };
  return {
    ...input,
    childrenBirthMonths: validMonths(input.childrenBirthMonths),
    plannedChildrenMonths: validMonths(input.plannedChildrenMonths).filter(
      (month) => monthsBetween(input.startMonth, month) >= 0
    ),
    renovationBudget: Math.max(0, input.renovationBudget || 0),
    plannedMarriageMonth:
      input.relationship !== 'MARRIED' &&
      ISO_MONTH.test(input.plannedMarriageMonth ?? '') &&
      monthsBetween(input.startMonth, input.plannedMarriageMonth) > 0
        ? input.plannedMarriageMonth
        : '',
    excludedPrograms: (input.excludedPrograms ?? []).filter((program) =>
      EXCLUDABLE_PROGRAMS.includes(program)
    ),
    termYears: Math.min(TERM_YEARS.max, Math.max(TERM_YEARS.min, input.termYears || TERM_YEARS.min))
  };
};

export const checkEligibility = (input: HouseholdInput): Eligibility[] => {
  return [
    otthonStart(input),
    csokPlusz(input),
    babavaro(input),
    falusiCsok(input),
    falusiCsokLoan(input)
  ].map((eligibility) =>
    input.excludedPrograms.includes(eligibility.program) ? excluded(eligibility) : eligibility
  );
};

const excluded = (eligibility: Eligibility): Eligibility => {
  return {
    ...eligibility,
    eligible: false,
    maxAmount: 0,
    reasons: ['Kizárva: korábban igénybe vett vagy nem kért', ...eligibility.reasons]
  };
};

// Promised children only count if born before the program's deadline.
const countedChildren = (input: HouseholdInput, deadlineYearsByPromised: readonly number[]) => {
  const existing = input.childrenBirthMonths.length;
  const promised = input.plannedChildrenMonths.filter((month, index) => {
    const deadlineYears = deadlineYearsByPromised[Math.min(index + 1, MAX_COUNTED_CHILDREN)] ?? 0;
    return monthsBetween(input.startMonth, month) <= deadlineYears * MONTHS_PER_YEAR;
  }).length;
  return { existing, promised, total: Math.min(existing + promised, MAX_COUNTED_CHILDREN) };
};

const otthonStart = (input: HouseholdInput): Eligibility => {
  const reasons = [
    ...common(input, OTTHON_START),
    ...when(
      input.applicantAge < OTTHON_START.minAge,
      `Legalább ${OTTHON_START.minAge} évesnek kell lenni`
    ),
    ...when(!input.firstHome, 'Csak első lakáshoz igényelhető'),
    ...when(
      input.propertyPrice > OTTHON_START.maxPropertyValue[input.propertyType],
      'Az ingatlan értéke meghaladja a felső határt'
    ),
    ...when(
      input.propertySize > 0 &&
        input.propertyPrice / input.propertySize > OTTHON_START.maxPricePerSqm,
      'A négyzetméterár meghaladja a felső határt'
    )
  ];
  const maxAmount = Math.min(
    OTTHON_START.maxAmount,
    input.propertyPrice * (1 - OTTHON_START.minDownPaymentRate)
  );
  return result(GOV_PROGRAM.OTTHON_START, reasons, maxAmount);
};

const csokPlusz = (input: HouseholdInput): Eligibility => {
  const children = countedChildren(input, CSOK_PLUSZ.childDeadlineYearsByPromised);
  const valueCaps = CSOK_PLUSZ.maxPropertyValue[input.firstHome ? 'FIRST_HOME' : 'OTHER'];
  const minArea = CSOK_PLUSZ.minFloorAreaByChildren[input.propertyType][children.total] ?? 0;
  const reasons = [
    ...common(input, CSOK_PLUSZ),
    ...when(
      children.promised < CSOK_PLUSZ.minNewChildren,
      'Legalább egy gyermeket vállalni kell a határidőn belül'
    ),
    ...when(
      input.applicantAge >= CSOK_PLUSZ.wifeAgeBelow && !input.pregnant,
      `A feleség ${CSOK_PLUSZ.wifeAgeBelow} év alatti legyen (várandósság esetén nincs korhatár)`
    ),
    ...when(
      input.propertyPrice > valueCaps[input.propertyType],
      'Az ingatlan értéke meghaladja a felső határt'
    ),
    ...when(input.propertySize < minArea, `Legalább ${minArea} m² hasznos alapterület szükséges`)
  ];
  return result(
    GOV_PROGRAM.CSOK_PLUSZ,
    reasons,
    CSOK_PLUSZ.maxAmountByChildren[children.total] ?? 0
  );
};

const babavaro = (input: HouseholdInput): Eligibility => {
  const hasChildInTime =
    input.pregnant ||
    input.plannedChildrenMonths.some(
      (month) =>
        monthsBetween(input.startMonth, month) <= BABAVARO.firstChildDeadlineYears * MONTHS_PER_YEAR
    );
  const reasons = [
    ...common(input, BABAVARO),
    ...when(
      input.applicantAge < BABAVARO.wifeMinAge || input.applicantAge >= BABAVARO.wifeAgeBelow,
      `A feleség ${BABAVARO.wifeMinAge} és ${BABAVARO.wifeAgeBelow} év közötti legyen`
    ),
    ...when(
      !hasChildInTime,
      `Gyermek nélkül ${BABAVARO.firstChildDeadlineYears} év után kamatozóvá válik`
    )
  ];
  return result(GOV_PROGRAM.BABAVARO, reasons, BABAVARO.maxAmount);
};

const falusiCsok = (input: HouseholdInput): Eligibility => {
  const children = countedChildren(input, CSOK_PLUSZ.childDeadlineYearsByPromised);
  const minArea = FALUSI_CSOK.minFloorAreaByChildren[input.propertyType][children.total] ?? 0;
  const grant = FALUSI_CSOK.grantByChildren[children.total] ?? 0;
  const reasons = [
    ...common(input, FALUSI_CSOK),
    ...when(input.settlementType !== 'VILLAGE', 'Csak kedvezményezett kistelepülésen igényelhető'),
    ...when(children.total === 0, 'Legalább egy meglévő vagy vállalt gyermek szükséges'),
    ...when(
      children.promised > 0 && input.applicantAge >= FALUSI_CSOK.wifeAgeBelow,
      `Gyermekvállaláshoz a feleség ${FALUSI_CSOK.wifeAgeBelow} év alatti legyen`
    ),
    ...when(input.propertySize < minArea, `Legalább ${minArea} m² hasznos alapterület szükséges`)
  ];
  // Used homes: only half of the grant may go toward the price, the rest is for modernization.
  const towardPrice =
    input.propertyCondition === 'USED' ? grant * FALUSI_CSOK.usedPurchaseMaxShareForPrice : grant;
  return result(GOV_PROGRAM.FALUSI_CSOK, reasons, towardPrice);
};

const falusiCsokLoan = (input: HouseholdInput): Eligibility => {
  const children = countedChildren(input, CSOK_PLUSZ.childDeadlineYearsByPromised);
  const maxAmount = FALUSI_CSOK_LOAN.maxAmountByChildren[children.total] ?? 0;
  const reasons = [
    ...common(input, FALUSI_CSOK_LOAN),
    ...when(input.settlementType !== 'VILLAGE', 'Csak kedvezményezett kistelepülésen igényelhető'),
    ...when(maxAmount === 0, 'Legalább két meglévő vagy vállalt gyermek szükséges')
  ];
  return result(GOV_PROGRAM.FALUSI_CSOK_LOAN, reasons, maxAmount);
};

const common = (
  input: HouseholdInput,
  program: { requiresMarriage: boolean; requiresCleanRecord: boolean; minInsuredYears?: number }
): string[] => {
  return [
    ...when(
      program.requiresMarriage && input.relationship !== 'MARRIED',
      'Csak házaspárok igényelhetik'
    ),
    ...when(program.requiresCleanRecord && !input.cleanRecord, 'Büntetlen előélet szükséges'),
    ...when(
      program.minInsuredYears !== undefined && input.insuredYears < program.minInsuredYears,
      `Legalább ${program.minInsuredYears} év folyamatos TB jogviszony szükséges`
    )
  ];
};

const when = (condition: boolean, reason: string): string[] => {
  return condition ? [reason] : [];
};

const result = (program: GovProgram, reasons: string[], maxAmount: number): Eligibility => {
  const eligible = reasons.length === 0 && maxAmount > 0;
  return { program, eligible, reasons, maxAmount: eligible ? maxAmount : 0 };
};
