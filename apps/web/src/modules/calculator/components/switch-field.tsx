import { Field, FieldContent, FieldDescription, FieldLabel } from '@hitel/ui/components/field';
import { Switch } from '@hitel/ui/components/switch';
import { useId } from 'react';

type Props = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
};

export const SwitchField = ({ label, checked, onChange, description }: Props) => {
  const id = useId();

  return (
    <Field orientation='horizontal'>
      <FieldContent>
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        {description && <FieldDescription>{description}</FieldDescription>}
      </FieldContent>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </Field>
  );
};
