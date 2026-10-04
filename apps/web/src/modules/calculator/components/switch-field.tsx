import { Field, FieldContent, FieldDescription, FieldLabel } from '@hitel/ui/components/field';
import { Switch } from '@hitel/ui/components/switch';
import { useFieldContext } from '../hooks/form-context';

type Props = {
  label: string;
  description?: string;
};

export const SwitchField = ({ label, description }: Props) => {
  const field = useFieldContext<boolean>();

  return (
    <Field orientation='horizontal'>
      <FieldContent>
        <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
        {description && <FieldDescription>{description}</FieldDescription>}
      </FieldContent>
      <Switch
        id={field.name}
        name={field.name}
        checked={field.state.value}
        onCheckedChange={field.handleChange}
      />
    </Field>
  );
};
