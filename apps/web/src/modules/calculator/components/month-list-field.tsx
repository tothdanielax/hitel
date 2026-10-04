import { Button } from '@hitel/ui/components/button';
import { Field, FieldDescription, FieldLegend, FieldSet } from '@hitel/ui/components/field';
import { PlusIcon, XIcon } from 'lucide-react';
import type { MonthRange } from '../constants';
import { useFieldContext } from '../hooks/form-context';
import { MonthPicker } from './month-picker';

type Props = {
  label: string;
  description: string;
  addLabel: string;
  range: MonthRange;
};

export const MonthListField = ({ label, description, addLabel, range }: Props) => {
  const field = useFieldContext<string[]>();
  const months = field.state.value;

  return (
    <FieldSet>
      <FieldLegend variant='label'>{label}</FieldLegend>
      <FieldDescription>{description}</FieldDescription>
      {months.map((month, index) => (
        <Field key={index} orientation='horizontal'>
          <MonthPicker
            aria-label={`${label} ${index + 1}.`}
            value={month}
            from={range.from}
            to={range.to}
            onChange={(value) => field.replaceValue(index, value)}
          />
          <Button
            type='button'
            variant='ghost'
            size='icon'
            aria-label={`${label} ${index + 1}. törlése`}
            onClick={() => field.removeValue(index)}
          >
            <XIcon />
          </Button>
        </Field>
      ))}
      <Button
        type='button'
        variant='outline'
        className='self-start'
        onClick={() => field.pushValue('')}
      >
        <PlusIcon />
        {addLabel}
      </Button>
    </FieldSet>
  );
};
