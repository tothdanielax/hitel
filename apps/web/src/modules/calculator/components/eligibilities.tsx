import type { Eligibility } from '@hitel/core/eligibility';
import { PROGRAMS } from '@hitel/core/constants';
import { Badge } from '@hitel/ui/components/badge';
import { Heading } from '@hitel/ui/components/heading';
import { Paragraph } from '@hitel/ui/components/paragraph';
import { formatHuf } from '@hitel/core/utils/currency';

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
              <Paragraph as='span' weight='medium'>
                {PROGRAMS[item.program].name}
              </Paragraph>
              <Badge variant={item.eligible ? 'default' : 'outline'}>
                {item.eligible ? `max. ${formatHuf(item.maxAmount)}` : 'Nem jár'}
              </Badge>
            </div>
            <Paragraph size='xs' muted>
              {PROGRAMS[item.program].legalBasis}
            </Paragraph>
            {item.reasons.length > 0 && (
              <ul className='list-disc pl-5'>
                {item.reasons.map((reason) => (
                  <li key={reason}>
                    <Paragraph size='sm' muted>
                      {reason}
                    </Paragraph>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};
