import { Button } from '@hitel/ui/components/button';
import { Field, FieldDescription, FieldLabel } from '@hitel/ui/components/field';
import { XIcon } from 'lucide-react';
import type { MonthRange } from '../constants';
import { useFieldContext } from '../hooks/form-context';
import { MonthPicker } from './month-picker';

type Props = {
  label: string;
  description?: string;
  range: MonthRange;
  // Optional months may be cleared back to empty.
  clearable?: boolean;
};

export const MonthField = ({ label, description, range, clearable = false }: Props) => {
  const field = useFieldContext<string>();

  return (
    <Field>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <div className='flex items-center gap-2'>
        <MonthPicker
          id={field.name}
          value={field.state.value}
          from={range.from}
          to={range.to}
          onChange={field.handleChange}
        />
        {clearable && field.state.value && (
          <Button
            type='button'
            variant='ghost'
            size='icon'
            aria-label={`${label} törlése`}
            onClick={() => field.handleChange('')}
          >
            <XIcon />
          </Button>
        )}
      </div>
      {description && <FieldDescription>{description}</FieldDescription>}
    </Field>
  );
};
