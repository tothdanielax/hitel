import { Button } from '@hitel/ui/components/button';
import { Field, FieldDescription, FieldTitle } from '@hitel/ui/components/field';
import { Input } from '@hitel/ui/components/input';
import { PlusIcon, XIcon } from 'lucide-react';

type Props = {
  label: string;
  description: string;
  addLabel: string;
  months: string[];
  onChange: (months: string[]) => void;
};

export const MonthListField = ({ label, description, addLabel, months, onChange }: Props) => {
  return (
    <Field>
      <FieldTitle>{label}</FieldTitle>
      <FieldDescription>{description}</FieldDescription>
      {months.map((month, index) => (
        <div key={index} className='flex gap-2'>
          <Input
            type='month'
            aria-label={`${label} ${index + 1}.`}
            value={month}
            onChange={(event) =>
              onChange(months.map((item, i) => (i === index ? event.target.value : item)))
            }
          />
          <Button
            variant='ghost'
            size='icon'
            aria-label='Törlés'
            onClick={() => onChange(months.filter((_, i) => i !== index))}
          >
            <XIcon />
          </Button>
        </div>
      ))}
      <Button variant='outline' className='self-start' onClick={() => onChange([...months, ''])}>
        <PlusIcon />
        {addLabel}
      </Button>
    </Field>
  );
};
