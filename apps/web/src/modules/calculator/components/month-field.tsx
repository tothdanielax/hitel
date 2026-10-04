import { Field, FieldDescription, FieldLabel } from '@hitel/ui/components/field';
import type { MonthRange } from '../constants';
import { useFieldContext } from '../hooks/form-context';
import { MonthPicker } from './month-picker';

type Props = {
  label: string;
  description?: string;
  range: MonthRange;
};

export const MonthField = ({ label, description, range }: Props) => {
  const field = useFieldContext<string>();

  return (
    <Field>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <MonthPicker
        id={field.name}
        value={field.state.value}
        from={range.from}
        to={range.to}
        onChange={field.handleChange}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
    </Field>
  );
};
