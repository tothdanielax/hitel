import { TERM_YEARS } from '@hitel/core/constants';
import { INPUT_LIMITS, MONEY_STEP, MONTH_RANGE } from '../constants';
import type { CalculatorForm } from '../hooks/use-calculator-form';
import { inRange } from '@hitel/core/utils/math';
import { FormBlock } from './form-block';

type Props = {
  form: CalculatorForm;
};

export const FinancesBlock = ({ form }: Props) => {
  return (
    <FormBlock title='Pénzügyek' description='Önerő, jövedelem, futamidő és folyósítás'>
      <div className='flex flex-col gap-4 sm:flex-row'>
        <form.AppField name='ownFunds' validators={{ onChange: inRange(INPUT_LIMITS.money) }}>
          {(field) => (
            <field.NumberField
              label='Rendelkezésre álló önerő'
              unit='Ft'
              step={MONEY_STEP.funds}
              description='Legfeljebb ennyit használ fel, a többit befektetésre hagyja, ha az olcsóbb'
            />
          )}
        </form.AppField>
        <form.AppField name='netIncome' validators={{ onChange: inRange(INPUT_LIMITS.netIncome) }}>
          {(field) => (
            <field.NumberField
              label='Háztartás nettó jövedelme'
              unit='Ft / hó'
              step={MONEY_STEP.income}
              description='Nettó, mert az MNB jövedelemarányos törlesztési korlátja (JTM) a nettó jövedelemből számol'
            />
          )}
        </form.AppField>
      </div>
      <div className='flex flex-col gap-4 sm:flex-row'>
        <form.AppField name='termYears' validators={{ onChange: inRange(TERM_YEARS) }}>
          {(field) => <field.NumberField label='Futamidő' unit='év' />}
        </form.AppField>
        <form.AppField name='startMonth'>
          {(field) => <field.MonthField label='Tervezett folyósítás' range={MONTH_RANGE.start} />}
        </form.AppField>
      </div>
    </FormBlock>
  );
};
