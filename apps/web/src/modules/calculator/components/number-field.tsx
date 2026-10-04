import { Field, FieldDescription, FieldLabel } from '@hitel/ui/components/field';
import { Input } from '@hitel/ui/components/input';
import { useId } from 'react';

type Props = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  description?: string;
  step?: number;
};

export const NumberField = ({ label, value, onChange, unit, description, step = 1 }: Props) => {
  const id = useId();

  return (
    <Field>
      <FieldLabel htmlFor={id}>
        {label}
        {unit && <span className='text-muted-foreground font-normal'>({unit})</span>}
      </FieldLabel>
      <Input
        id={id}
        type='number'
        inputMode='numeric'
        min={0}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.valueAsNumber || 0)}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
    </Field>
  );
};
