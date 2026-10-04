import { Field, FieldDescription, FieldError, FieldLabel } from '@hitel/ui/components/field';
import { Input } from '@hitel/ui/components/input';
import { Paragraph } from '@hitel/ui/components/paragraph';
import { PERCENT_DECIMALS, PERCENT_SCALE } from '../constants';
import { useFieldContext } from '../hooks/form-context';

type Props = {
  label: string;
  unit?: string;
  description?: string;
  step?: number;
  min?: number;
  max?: number;
  // Stores a fraction (0.055) while the user types a percentage (5.5).
  percent?: boolean;
};

export const NumberField = ({
  label,
  unit,
  description,
  step = 1,
  min = 0,
  max,
  percent = false
}: Props) => {
  const field = useFieldContext<number>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const scale = percent ? PERCENT_SCALE : 1;

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
      <Input
        id={field.name}
        name={field.name}
        type='number'
        inputMode='decimal'
        min={min * scale}
        max={max === undefined ? undefined : max * scale}
        step={percent ? step * scale : step}
        value={Math.round(field.state.value * scale * PERCENT_DECIMALS) / PERCENT_DECIMALS}
        aria-invalid={isInvalid}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange((event.target.valueAsNumber || 0) / scale)}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={field.state.meta.errors.map((message) => ({ message }))} />}
    </Field>
  );
};
