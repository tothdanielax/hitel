import { Field, FieldDescription, FieldError, FieldLabel } from '@hitel/ui/components/field';
import { Input } from '@hitel/ui/components/input';
import { useFieldContext } from '../hooks/form-context';

type Props = {
  label: string;
  unit?: string;
  description?: string;
  step?: number;
  min?: number;
  max?: number;
};

export const NumberField = ({ label, unit, description, step = 1, min = 0, max }: Props) => {
  const field = useFieldContext<number>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>
        {label}
        {unit && <span className='text-muted-foreground font-normal'>({unit})</span>}
      </FieldLabel>
      <Input
        id={field.name}
        name={field.name}
        type='number'
        inputMode='numeric'
        min={min}
        max={max}
        step={step}
        value={field.state.value}
        aria-invalid={isInvalid}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.valueAsNumber || 0)}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={field.state.meta.errors.map((message) => ({ message }))} />}
    </Field>
  );
};
