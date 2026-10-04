import { cn } from 'cn';
import type { HTMLAttributes } from 'react';

type Props = HTMLAttributes<HTMLElement> & {
  as?: 'p' | 'span' | 'dt' | 'dd';
  size?: keyof typeof SIZE;
  weight?: keyof typeof WEIGHT;
  muted?: boolean;
  numeric?: boolean;
};

export const Paragraph = ({
  as: Component = 'p',
  size = 'base',
  weight = 'normal',
  muted = false,
  numeric = false,
  className,
  ...props
}: Props) => {
  return (
    <Component
      className={cn(
        SIZE[size],
        WEIGHT[weight],
        muted && 'text-muted-foreground',
        numeric && 'tabular-nums',
        className
      )}
      {...props}
    />
  );
};

const SIZE = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  xl: 'text-xl sm:text-2xl'
} as const;

const WEIGHT = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold'
} as const;
