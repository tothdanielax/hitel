import { useStore } from '@tanstack/react-form';
import { MONTH_RANGE } from '../constants';
import type { CalculatorForm } from '../hooks/use-calculator-form';
import { FormBlock } from './form-block';

type Props = {
  form: CalculatorForm;
};

export const FamilyBlock = ({ form }: Props) => {
  const isMarried = useStore(form.store, (state) => state.values.relationship === 'MARRIED');

  return (
    <FormBlock
      title='Gyermekek és családtervezés'
      description='A támogatások jelentős része a gyermekek számától és születési idejétől függ'
    >
      <form.AppField name='childrenBirthMonths' mode='array'>
        {(field) => (
          <field.MonthListField
            label='Meglévő gyermekek'
            description='Születési hónap'
            addLabel='Gyermek hozzáadása'
            range={MONTH_RANGE.born}
          />
        )}
      </form.AppField>
      <form.AppField name='pregnant'>
        {(field) => (
          <field.SwitchField
            label='Várandósság'
            description={
              isMarried
                ? 'Legalább 12. hetes magzat'
                : 'Csak házaspároknak számít (CSOK Plusz, Babaváró)'
            }
            disabled={!isMarried}
          />
        )}
      </form.AppField>
      <form.AppField name='plannedChildrenMonths' mode='array'>
        {(field) => (
          <field.MonthListField
            label='Tervezett gyermekek'
            description='Várható születési hónap (a várandósság is ide tartozik)'
            addLabel='Tervezett gyermek'
            range={MONTH_RANGE.planned}
          />
        )}
      </form.AppField>
    </FormBlock>
  );
};
