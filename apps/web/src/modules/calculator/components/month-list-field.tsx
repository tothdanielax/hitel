import { Button } from '@hitel/ui/components/button';
import { Field, FieldDescription, FieldLegend, FieldSet } from '@hitel/ui/components/field';
import { Input } from '@hitel/ui/components/input';
import { PlusIcon, XIcon } from 'lucide-react';
import { useFieldContext } from '../hooks/form-context';

type Props = {
  label: string;
  description: string;
  addLabel: string;
};

export const MonthListField = ({ label, description, addLabel }: Props) => {
  const field = useFieldContext<string[]>();
  const months = field.state.value;

  return (
    <FieldSet>
      <FieldLegend variant='label'>{label}</FieldLegend>
      <FieldDescription>{description}</FieldDescription>
      {months.map((month, index) => (
        <Field key={index} orientation='horizontal'>
          <Input
            type='month'
            aria-label={`${label} ${index + 1}.`}
            value={month}
            onChange={(event) => field.replaceValue(index, event.target.value)}
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
