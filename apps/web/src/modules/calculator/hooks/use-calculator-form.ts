import { useState } from 'react';

export type Relationship = 'single' | 'married' | 'partners';
export type PropertyCondition = 'new' | 'used';
export type SettlementType = 'budapest' | 'city' | 'village';

export type CalculatorForm = {
  relationship: Relationship;
  applicantAge: number;
  partnerAge: number;
  insuredYears: number;
  firstHome: boolean;
  cleanRecord: boolean;
  pregnant: boolean;
  childrenBirthMonths: string[];
  plannedChildrenMonths: string[];
  propertyPrice: number;
  propertySize: number;
  propertyCondition: PropertyCondition;
  settlementType: SettlementType;
  ownFunds: number;
  netIncome: number;
  termYears: number;
};

const INITIAL_FORM: CalculatorForm = {
  relationship: 'married',
  applicantAge: 30,
  partnerAge: 29,
  insuredYears: 5,
  firstHome: true,
  cleanRecord: true,
  pregnant: false,
  childrenBirthMonths: [],
  plannedChildrenMonths: ['2027-09', '2030-03'],
  propertyPrice: 80_000_000,
  propertySize: 70,
  propertyCondition: 'used',
  settlementType: 'city',
  ownFunds: 10_000_000,
  netIncome: 1_200_000,
  termYears: 25
};

export const useCalculatorForm = () => {
  const [form, setForm] = useState(INITIAL_FORM);

  const update = <K extends keyof CalculatorForm>(key: K, value: CalculatorForm[K]): void => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  return { form, update };
};
