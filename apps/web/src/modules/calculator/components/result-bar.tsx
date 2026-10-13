import type { Plan } from '@hitel/core/plan';
import { Paragraph } from '@hitel/ui/components/paragraph';
import { formatHuf } from '@hitel/core/utils/currency';
import { ChevronDownIcon } from 'lucide-react';
import { RESULTS_ID } from '../constants';

type Props = {
  plan: Plan;
};

// Narrow screens show the result below the form, so the key number stays in view while editing.
export const ResultBar = ({ plan }: Props) => {
  return (
    <a
      href={`#${RESULTS_ID}`}
      className='bg-background/95 fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden'
    >
      <Paragraph as='span' size='sm' muted>
        Induló havi törlesztő
      </Paragraph>
      <Paragraph as='span' weight='semibold' numeric className='flex items-center gap-1'>
        {formatHuf(plan.schedule.initialMonthly)}
        <ChevronDownIcon className='size-4' />
      </Paragraph>
    </a>
  );
};
