import { Field, FieldDescription, FieldError, FieldLabel } from '@hitel/ui/components/field';
import { Paragraph } from '@hitel/ui/components/paragraph';
import {
  NumberField as NumberFieldRoot,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput
} from '@hitel/ui/components/reui/number-field';
import { useFieldContext } from '../hooks/form-context';

type Props = {
  label: string;
  unit?: string;
  description?: string;
  step?: number;
  // Stores a fraction (0.055) and shows it as a percentage (5,5%).
  percent?: boolean;
};

const PERCENT_FORMAT: Intl.NumberFormatOptions = { style: 'percent', maximumFractionDigits: 2 };

export const NumberField = ({ label, unit, description, step = 1, percent = false }: Props) => {
  const field = useFieldContext<number>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>
        {label}
        {unit && (
          <Paragraph as='span' size='sm' muted>
            ({unit})
          </Paragraph>
        )}
      </FieldLabel>
      <NumberFieldRoot
        id={field.name}
        name={field.name}
        locale='hu-HU'
        step={step}
        {...(percent && { format: PERCENT_FORMAT })}
        value={field.state.value}
        onValueChange={(value) => {
          if (value !== null) field.handleChange(value);
        }}
      >
        <NumberFieldGroup aria-invalid={isInvalid}>
          <NumberFieldDecrement />
          <NumberFieldInput onBlur={field.handleBlur} />
          <NumberFieldIncrement />
        </NumberFieldGroup>
      </NumberFieldRoot>
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={field.state.meta.errors.map((message) => ({ message }))} />}
    </Field>
  );
};
