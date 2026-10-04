import { cn } from 'cn';
import type { HTMLAttributes } from 'react';

type Props = HTMLAttributes<HTMLHeadingElement> & {
  as: 'h1' | 'h2' | 'h3';
};

export const Heading = ({ as: Component, className, ...props }: Props) => {
  return <Component className={cn(SIZE[Component], className)} {...props} />;
};

const SIZE = {
  h1: 'text-3xl font-semibold tracking-tight sm:text-4xl',
  h2: 'text-2xl font-semibold',
  h3: 'text-lg font-semibold'
} as const;
