import {
  INPUT_LIMITS,
  MONEY_STEP,
  PROPERTY_CONDITION_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  SETTLEMENT_OPTIONS
} from '../constants';
import type { CalculatorForm } from '../hooks/use-calculator-form';
import { inRange } from '@hitel/core/utils/math';
import { FormBlock } from './form-block';

type Props = {
  form: CalculatorForm;
};

export const PropertyBlock = ({ form }: Props) => {
  return (
    <FormBlock title='Ingatlan' description='Vételár, típus, állapot és elhelyezkedés'>
      <div className='flex flex-col gap-4 sm:flex-row'>
        <form.AppField name='propertyPrice' validators={{ onChange: inRange(INPUT_LIMITS.money) }}>
          {(field) => <field.NumberField label='Vételár' unit='Ft' step={MONEY_STEP.price} />}
        </form.AppField>
        <form.AppField
          name='propertySize'
          validators={{ onChange: inRange(INPUT_LIMITS.propertySize) }}
        >
          {(field) => <field.NumberField label='Hasznos alapterület' unit='m²' />}
        </form.AppField>
      </div>
      <form.AppField name='renovationBudget' validators={{ onChange: inRange(INPUT_LIMITS.money) }}>
        {(field) => (
          <field.NumberField
            label='Tervezett felújítás'
            unit='Ft'
            step={MONEY_STEP.renovation}
            description='Otthon Start és CSOK Plusz nem fedezheti, csak önerő, Babaváró, banki lakáshitel vagy falusi CSOK'
          />
        )}
      </form.AppField>
      <form.AppField name='propertyType'>
        {(field) => <field.ChoiceField label='Típus' options={PROPERTY_TYPE_OPTIONS} />}
      </form.AppField>
      <form.AppField name='propertyCondition'>
        {(field) => <field.ChoiceField label='Állapot' options={PROPERTY_CONDITION_OPTIONS} />}
      </form.AppField>
      <form.AppField name='settlementType'>
        {(field) => <field.ChoiceField label='Település' options={SETTLEMENT_OPTIONS} />}
      </form.AppField>
    </FormBlock>
  );
};
