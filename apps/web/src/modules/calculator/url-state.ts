import { ISO_MONTH } from '@hitel/core/constants';
import { diffFrom, mergeInto } from '@hitel/core/utils/object';
import {
  DEFAULT_VALUES,
  PROPERTY_CONDITION_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  RELATIONSHIP_OPTIONS,
  SETTLEMENT_OPTIONS
} from './constants';

export type CalculatorValues = typeof DEFAULT_VALUES;

// The URL holds only what differs from the defaults, so links stay short.
export const toSearch = (values: CalculatorValues): Record<string, unknown> => {
  return (diffFrom(values, DEFAULT_VALUES) as Record<string, unknown> | undefined) ?? {};
};

// URLs are untrusted: unknown keys, wrong types, invalid choices and months fall back to defaults.
export const fromSearch = (search: unknown): CalculatorValues => {
  const merged = mergeInto(DEFAULT_VALUES, search);
  const choice = <T extends string>(value: T, options: Record<T, string>, fallback: T): T => {
    return Object.hasOwn(options, value) ? value : fallback;
  };
  const months = (list: string[]) => list.filter((month) => ISO_MONTH.test(month));

  return {
    ...merged,
    relationship: choice(merged.relationship, RELATIONSHIP_OPTIONS, DEFAULT_VALUES.relationship),
    propertyType: choice(merged.propertyType, PROPERTY_TYPE_OPTIONS, DEFAULT_VALUES.propertyType),
    propertyCondition: choice(
      merged.propertyCondition,
      PROPERTY_CONDITION_OPTIONS,
      DEFAULT_VALUES.propertyCondition
    ),
    settlementType: choice(
      merged.settlementType,
      SETTLEMENT_OPTIONS,
      DEFAULT_VALUES.settlementType
    ),
    startMonth: ISO_MONTH.test(merged.startMonth) ? merged.startMonth : DEFAULT_VALUES.startMonth,
    childrenBirthMonths: months(merged.childrenBirthMonths),
    plannedChildrenMonths: months(merged.plannedChildrenMonths),
    settings: {
      ...merged.settings,
      // Only the user editable parts of an offer; names and source links always come from the defaults.
      offers: DEFAULT_VALUES.settings.offers.map((offer, index) => {
        const { enabled, annualRate, fixationYears } = merged.settings.offers[index] ?? offer;
        return { ...offer, enabled, annualRate, fixationYears };
      })
    }
  };
};
