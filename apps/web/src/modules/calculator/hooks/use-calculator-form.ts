import { addMonths, currentMonth } from '@hitel/core/months';
import { buildPlan } from '@hitel/core/plan';
import { createFormHook, useStore } from '@tanstack/react-form';
import { useEffect } from 'react';
import { ChoiceField } from '../components/choice-field';
import { MonthField } from '../components/month-field';
import { MonthListField } from '../components/month-list-field';
import { NumberField } from '../components/number-field';
import { SwitchField } from '../components/switch-field';
import { DEFAULT_VALUES } from '../constants';
import { fieldContext, formContext } from './form-context';

const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { ChoiceField, MonthField, MonthListField, NumberField, SwitchField },
  formComponents: {}
});

export const useCalculatorForm = () => {
  const form = useAppForm({ defaultValues: DEFAULT_VALUES });
  const values = useStore(form.store, (state) => state.values);

  useEffect(() => {
    const earliest = addMonths(currentMonth(), 1);
    if (form.getFieldValue('startMonth') < earliest) form.setFieldValue('startMonth', earliest);
  }, [form]);

  return { form, plan: buildPlan(values, values.settings) };
};

export type CalculatorForm = ReturnType<typeof useCalculatorForm>['form'];
