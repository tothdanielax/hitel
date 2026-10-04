import { Field, FieldLabel, FieldTitle } from '@hitel/ui/components/field';
import { RadioGroup, RadioGroupItem } from '@hitel/ui/components/radio-group';

type Props<T extends string> = {
  label: string;
  value: T;
  options: Record<T, string>;
  onChange: (value: T) => void;
};

export const ChoiceField = <T extends string>({ label, value, options, onChange }: Props<T>) => {
  return (
    <Field>
      <FieldTitle>{label}</FieldTitle>
      <RadioGroup
        className='flex flex-wrap gap-4'
        value={value}
        onValueChange={(next) => onChange(next as T)}
      >
        {Object.entries<string>(options).map(([key, text]) => (
          <FieldLabel key={key} className='flex items-center gap-2 font-normal'>
            <RadioGroupItem value={key} />
            {text}
          </FieldLabel>
        ))}
      </RadioGroup>
    </Field>
  );
};
