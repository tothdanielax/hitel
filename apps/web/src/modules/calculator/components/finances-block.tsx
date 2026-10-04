import { TERM_YEARS } from '@hitel/core/constants';
import { INPUT_LIMITS, MONEY_STEP } from '../constants';
import type { CalculatorForm } from '../hooks/use-calculator-form';
import { inRange } from '../utils/validators';
import { FormBlock } from './form-block';

type Props = {
  form: CalculatorForm;
};

export const FinancesBlock = ({ form }: Props) => {
  return (
    <FormBlock title='Pénzügyek' description='Önerő, jövedelem, futamidő és folyósítás'>
      <div className='flex flex-col gap-4 sm:flex-row'>
        <form.AppField name='ownFunds' validators={{ onChange: inRange(INPUT_LIMITS.money) }}>
          {(field) => <field.NumberField label='Önerő' unit='Ft' step={MONEY_STEP.funds} />}
        </form.AppField>
        <form.AppField name='netIncome' validators={{ onChange: inRange(INPUT_LIMITS.netIncome) }}>
          {(field) => (
            <field.NumberField
              label='Háztartás nettó jövedelme'
              unit='Ft / hó'
              step={MONEY_STEP.income}
            />
          )}
        </form.AppField>
      </div>
      <div className='flex flex-col gap-4 sm:flex-row'>
        <form.AppField name='termYears' validators={{ onChange: inRange(TERM_YEARS) }}>
          {(field) => (
            <field.NumberField
              label='Futamidő'
              unit='év'
              min={TERM_YEARS.min}
              max={TERM_YEARS.max}
            />
          )}
        </form.AppField>
        <form.AppField name='startMonth'>
          {(field) => <field.MonthField label='Tervezett folyósítás' />}
        </form.AppField>
      </div>
    </FormBlock>
  );
};
