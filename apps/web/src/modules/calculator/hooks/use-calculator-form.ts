import { addMonths, currentMonth } from '@hitel/core/utils/date';
import { buildPlan } from '@hitel/core/plan';
import { createFormHook, useStore } from '@tanstack/react-form';
import { useRouter } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { CheckboxField } from '../components/checkbox-field';
import { ChoiceField } from '../components/choice-field';
import { MonthField } from '../components/month-field';
import { MonthListField } from '../components/month-list-field';
import { NumberField } from '../components/number-field';
import { SwitchField } from '../components/switch-field';
import { DEFAULT_VALUES } from '../constants';
import { fromSearch, toSearch } from '../url-state';
import { fieldContext, formContext } from './form-context';

const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    CheckboxField,
    ChoiceField,
    MonthField,
    MonthListField,
    NumberField,
    SwitchField
  },
  formComponents: {}
});

export const useCalculatorForm = () => {
  // Starts from the defaults so the prerendered HTML matches the first client render.
  const [initialValues, setInitialValues] = useState(DEFAULT_VALUES);
  const form = useAppForm({ defaultValues: initialValues });
  const values = useStore(form.store, (state) => state.values);
  const router = useRouter();
  const [restored, setRestored] = useState(false);

  // New default values reach the fields through the form's own update (array fields included).
  useEffect(() => {
    const shared = fromSearch(router.state.location.search);
    const earliest = addMonths(currentMonth(), 1);
    setInitialValues({
      ...shared,
      startMonth: shared.startMonth < earliest ? earliest : shared.startMonth
    });
    setRestored(true);
  }, [router]);

  useEffect(() => {
    if (!restored) return;
    void router.navigate({ to: '/', search: toSearch(values), replace: true, resetScroll: false });
  }, [restored, router, values]);

  return { form, plan: buildPlan(values, values.settings) };
};

export type CalculatorForm = ReturnType<typeof useCalculatorForm>['form'];
