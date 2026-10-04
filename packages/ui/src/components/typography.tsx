import { cn } from '@hitel/ui/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';

const weightVariants = cva('', {
  variants: {
    weight: {
      thin: 'font-thin',
      extralight: 'font-extralight',
      light: 'font-light',
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
      extrabold: 'font-extrabold'
    }
  }
});
type WeightProps = VariantProps<typeof weightVariants>;

const mutedVariants = cva('', {
  variants: {
    muted: {
      true: 'text-muted-foreground'
    }
  }
});
type MutedProps = VariantProps<typeof mutedVariants>;

const headingSizeVariants = cva('', {
  variants: {
    size: {
      h1: 'text-4xl',
      h2: 'text-3xl',
      h3: 'text-2xl',
      h4: 'text-xl',
      h5: 'text-lg',
      h6: 'text-base'
    }
  },
  defaultVariants: {
    size: 'h6'
  }
});
type HeadingSizeProps = VariantProps<typeof headingSizeVariants>;

type HeadingProps = HTMLAttributes<HTMLHeadingElement> &
  WeightProps &
  MutedProps &
  HeadingSizeProps & { as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' };

export const Heading = ({
  as,
  size,
  weight,
  className,
  muted,
  children,
  ...props
}: HeadingProps) => {
  const Component = as || 'h6';

  return (
    <Component
      className={cn(
        headingSizeVariants({
          size: size || as
        }),
        mutedVariants({ muted }),
        weightVariants({ weight }),
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

const paragraphVariants = cva('', {
  variants: {
    size: {
      '6xl': 'text-6xl',
      '4xl': 'text-4xl',
      '3xl': 'text-3xl',
      '2xl': 'text-2xl',
      xl: 'text-xl',
      lg: 'text-lg',
      base: 'text-base',
      sm: 'text-sm',
      xs: 'text-xs'
    },
    mono: {
      true: 'font-mono'
    }
  },
  defaultVariants: {
    size: 'sm'
  }
});
type ParagraphVariantProps = VariantProps<typeof paragraphVariants>;

type ParagraphProps = HTMLAttributes<HTMLParagraphElement> &
  WeightProps &
  MutedProps &
  ParagraphVariantProps & { as?: 'span' | 'p' };

export const Paragraph = ({
  as,
  muted,
  size,
  weight,
  className,
  children,
  mono,
  ...props
}: ParagraphProps) => {
  const Component = as || 'p';

  return (
    <Component
      className={cn(
        paragraphVariants({
          size,
          mono
        }),
        mutedVariants({ muted }),
        weightVariants({ weight }),
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};
