import {
  Field,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet
} from '@hitel/ui/components/field';
import type { ReactNode } from 'react';
import { RadioGroup, RadioGroupItem } from '@hitel/ui/components/radio-group';
import { useFieldContext } from '../hooks/form-context';

type Props = {
  label: string;
  options: Record<string, string>;
  description?: ReactNode;
};

export const ChoiceField = ({ label, options, description }: Props) => {
  const field = useFieldContext<string>();

  return (
    <FieldSet>
      <FieldLegend variant='label'>{label}</FieldLegend>
      {description && <FieldDescription>{description}</FieldDescription>}
      <RadioGroup
        name={field.name}
        className='flex flex-wrap gap-x-6 gap-y-3'
        value={field.state.value}
        onValueChange={(value) => field.handleChange(String(value))}
      >
        {Object.entries(options).map(([value, text]) => (
          <Field key={value} orientation='horizontal' className='w-auto'>
            <RadioGroupItem value={value} id={`${field.name}-${value}`} />
            <FieldLabel htmlFor={`${field.name}-${value}`} className='font-normal'>
              {text}
            </FieldLabel>
          </Field>
        ))}
      </RadioGroup>
    </FieldSet>
  );
};
