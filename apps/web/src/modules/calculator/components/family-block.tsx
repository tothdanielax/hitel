import type { CalculatorForm } from '../hooks/use-calculator-form';
import { FormBlock } from './form-block';

type Props = {
  form: CalculatorForm;
};

export const FamilyBlock = ({ form }: Props) => {
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
          />
        )}
      </form.AppField>
      <form.AppField name='pregnant'>
        {(field) => (
          <field.SwitchField label='Várandósság' description='Legalább 12. hetes magzat' />
        )}
      </form.AppField>
      <form.AppField name='plannedChildrenMonths' mode='array'>
        {(field) => (
          <field.MonthListField
            label='Tervezett gyermekek'
            description='Várható születési hónap (a várandósság is ide tartozik)'
            addLabel='Tervezett gyermek'
          />
        )}
      </form.AppField>
    </FormBlock>
  );
};
