import { Field, FieldContent, FieldDescription, FieldLabel } from '@hitel/ui/components/field';
import { Switch } from '@hitel/ui/components/switch';
import { useFieldContext } from '../hooks/form-context';

type Props = {
  label: string;
  description?: string;
  disabled?: boolean;
};

export const SwitchField = ({ label, description, disabled = false }: Props) => {
  const field = useFieldContext<boolean>();

  return (
    <Field orientation='horizontal' data-disabled={disabled}>
      <FieldContent>
        <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
        {description && <FieldDescription>{description}</FieldDescription>}
      </FieldContent>
      <Switch
        id={field.name}
        name={field.name}
        checked={field.state.value}
        disabled={disabled}
        onCheckedChange={field.handleChange}
      />
    </Field>
  );
};
