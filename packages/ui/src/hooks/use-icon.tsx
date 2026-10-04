import React, { isValidElement, type ReactElement } from 'react';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@hitel/ui/lib/utils';

export const useIcon = ({
  icon: Icon,
  className
}: {
  icon?: LucideIcon | ReactElement;
  className?: string;
}) => {
  if (!Icon) return null;
  if (isValidElement(Icon)) return Icon;

  return <Icon className={cn('size-4', className)} />;
};
