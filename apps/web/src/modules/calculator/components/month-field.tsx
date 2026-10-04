import { Field, FieldDescription, FieldLabel } from '@hitel/ui/components/field';
import { Input } from '@hitel/ui/components/input';
import { useFieldContext } from '../hooks/form-context';

type Props = {
  label: string;
  description?: string;
};

export const MonthField = ({ label, description }: Props) => {
  const field = useFieldContext<string>();

  return (
    <Field>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Input
        id={field.name}
        name={field.name}
        type='month'
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
    </Field>
  );
};
