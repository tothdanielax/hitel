import { Checkbox } from '@hitel/ui/components/checkbox';
import { Field, FieldLabel } from '@hitel/ui/components/field';
import { useFieldContext } from '../hooks/form-context';

type Props = {
  label: string;
};

export const CheckboxField = ({ label }: Props) => {
  const field = useFieldContext<boolean>();

  return (
    <Field orientation='horizontal' className='w-auto shrink-0'>
      <Checkbox
        id={field.name}
        name={field.name}
        checked={field.state.value}
        onCheckedChange={(checked) => field.handleChange(checked)}
      />
      <FieldLabel htmlFor={field.name} className='font-normal'>
        {label}
      </FieldLabel>
    </Field>
  );
};
