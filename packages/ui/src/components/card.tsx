import { cn } from '@hitel/ui/lib/utils';
import type { ComponentProps } from 'react';

type CardProps = ComponentProps<'div'> & { size?: 'default' | 'sm' };
export const Card = ({ className, size = 'default', ...props }: CardProps) => {
  return (
    <div
      data-slot='card'
      data-size={size}
      className={cn(
        'group/card flex flex-col gap-4 overflow-hidden rounded-xl bg-card py-4 text-card-foreground text-sm ring-1 ring-foreground/10 has-[>img:first-child]:pt-0 has-data-[slot=card-footer]:pb-0 data-[size=sm]:gap-3 data-[size=sm]:py-3 data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl',
        className
      )}
      {...props}
    />
  );
};

type CardHeaderProps = ComponentProps<'div'>;
export const CardHeader = ({ className, ...props }: CardHeaderProps) => {
  return (
    <div
      data-slot='card-header'
      className={cn(
        'group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-4 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] group-data-[size=sm]/card:px-3 [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3',
        className
      )}
      {...props}
    />
  );
};

type CardTitleProps = ComponentProps<'div'>;
export const CardTitle = ({ className, ...props }: CardTitleProps) => {
  return (
    <div
      data-slot='card-title'
      className={cn(
        'font-semibold text-base leading-snug group-data-[size=sm]/card:text-sm',
        className
      )}
      {...props}
    />
  );
};

type CardDescriptionProps = ComponentProps<'div'>;
export const CardDescription = ({ className, ...props }: CardDescriptionProps) => {
  return (
    <div
      data-slot='card-description'
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
};

type CardActionProps = ComponentProps<'div'>;
export const CardAction = ({ className, ...props }: CardActionProps) => {
  return (
    <div
      data-slot='card-action'
      className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
      {...props}
    />
  );
};

type CardContentProps = ComponentProps<'div'>;
export const CardContent = ({ className, ...props }: CardContentProps) => {
  return (
    <div
      data-slot='card-content'
      className={cn('px-4 group-data-[size=sm]/card:px-3', className)}
      {...props}
    />
  );
};

type CardFooterProps = ComponentProps<'div'>;
export const CardFooter = ({ className, ...props }: CardFooterProps) => {
  return (
    <div
      data-slot='card-footer'
      className={cn(
        'flex items-center rounded-b-xl border-t bg-muted/50 p-4 group-data-[size=sm]/card:p-3',
        className
      )}
      {...props}
    />
  );
};
