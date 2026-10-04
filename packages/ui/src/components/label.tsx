import { cn } from '@hitel/ui/lib/utils';
import type { ComponentProps } from 'react';

type LabelProps = ComponentProps<'label'>;
export const Label = ({ className, ...props }: LabelProps) => {
  return (
    // oxfmt-ignore lint/a11y/noLabelWithoutControl: control/input is defined in another component
    <label
      data-slot='label'
      className={cn(
        'flex select-none items-center gap-2 font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50',
        className
      )}
      {...props}
    />
  );
};
