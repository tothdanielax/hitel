import { cn } from '@hitel/ui/lib/utils';
import type { ComponentProps } from 'react';

type KbdProps = ComponentProps<'kbd'>;
export const Kbd = ({ className, ...props }: KbdProps) => {
  return (
    <kbd
      data-slot='kbd'
      className={cn(
        "pointer-events-none inline-flex h-5 w-fit min-w-5 select-none items-center justify-center gap-1 rounded-sm bg-muted in-data-[slot=tooltip-content]:bg-background/20 px-1 font-medium font-sans in-data-[slot=tooltip-content]:text-background text-muted-foreground text-xs dark:in-data-[slot=tooltip-content]:bg-background/10 [&_svg:not([class*='size-'])]:size-3",
        className
      )}
      {...props}
    />
  );
};

type KbdGroupProps = ComponentProps<'div'>;
export const KbdGroup = ({ className, ...props }: KbdGroupProps) => {
  return (
    <kbd
      data-slot='kbd-group'
      className={cn('inline-flex items-center gap-1', className)}
      {...props}
    />
  );
};
