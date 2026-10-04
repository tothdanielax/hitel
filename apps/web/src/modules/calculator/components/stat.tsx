import { Paragraph } from '@hitel/ui/components/paragraph';
import { Tooltip, TooltipContent, TooltipTrigger } from '@hitel/ui/components/tooltip';
import { InfoIcon } from 'lucide-react';

type Props = {
  label: string;
  value: string;
  hint?: string;
  emphasis?: boolean;
};

export const Stat = ({ label, value, hint, emphasis = false }: Props) => {
  return (
    <div className='flex flex-col gap-1'>
      <Paragraph as='dt' size={emphasis ? 'sm' : 'xs'} muted className='flex items-center gap-1'>
        {label}
        {hint && (
          <Tooltip>
            <TooltipTrigger aria-label={hint} className='text-muted-foreground'>
              <InfoIcon className='size-3.5' />
            </TooltipTrigger>
            <TooltipContent className='max-w-64'>{hint}</TooltipContent>
          </Tooltip>
        )}
      </Paragraph>
      <Paragraph
        as='dd'
        size={emphasis ? 'xl' : 'sm'}
        weight={emphasis ? 'semibold' : 'normal'}
        numeric
      >
        {value}
      </Paragraph>
    </div>
  );
};
