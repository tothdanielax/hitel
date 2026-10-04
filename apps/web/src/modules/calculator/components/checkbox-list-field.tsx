import { Checkbox } from '@hitel/ui/components/checkbox';
import {
  Field,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet
} from '@hitel/ui/components/field';
import { useFieldContext } from '../hooks/form-context';

type Props = {
  label: string;
  description?: string;
  options: Record<string, string>;
};

export const CheckboxListField = ({ label, description, options }: Props) => {
  const field = useFieldContext<string[]>();
  const selected = field.state.value;

  return (
    <FieldSet>
      <FieldLegend variant='label'>{label}</FieldLegend>
      {description && <FieldDescription>{description}</FieldDescription>}
      <div className='flex flex-wrap gap-x-6 gap-y-3'>
        {Object.entries(options).map(([value, text]) => (
          <Field key={value} orientation='horizontal' className='w-auto'>
            <Checkbox
              id={`${field.name}-${value}`}
              checked={selected.includes(value)}
              onCheckedChange={(checked) =>
                field.handleChange(
                  checked ? [...selected, value] : selected.filter((item) => item !== value)
                )
              }
            />
            <FieldLabel htmlFor={`${field.name}-${value}`} className='font-normal'>
              {text}
            </FieldLabel>
          </Field>
        ))}
      </div>
    </FieldSet>
  );
};
