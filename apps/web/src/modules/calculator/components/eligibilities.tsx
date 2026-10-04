import type { Eligibility } from '@hitel/core/eligibility';
import { Badge } from '@hitel/ui/components/badge';
import { Heading } from '@hitel/ui/components/typography';
import { formatHuf } from '@/utils/currency';
import { PROGRAM_NAMES } from '../constants';

type Props = {
  eligibility: Eligibility[];
};

export const Eligibilities = ({ eligibility }: Props) => {
  return (
    <section className='flex flex-col gap-3'>
      <Heading as='h3'>Állami támogatások</Heading>
      <ul className='flex flex-col gap-3'>
        {eligibility.map((item) => (
          <li key={item.program} className='flex flex-col gap-1'>
            <div className='flex flex-wrap items-center gap-2'>
              <span className='font-medium'>{PROGRAM_NAMES[item.program]}</span>
              <Badge variant={item.eligible ? 'default' : 'outline'}>
                {item.eligible ? `max. ${formatHuf(item.maxAmount)}` : 'Nem jár'}
              </Badge>
            </div>
            {item.reasons.length > 0 && (
              <ul className='text-muted-foreground list-disc pl-5 text-sm'>
                {item.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};
