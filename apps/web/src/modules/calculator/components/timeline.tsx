import type { PlanTimelineEntry } from '@hitel/core/plan';
import { Heading } from '@hitel/ui/components/heading';
import { Paragraph } from '@hitel/ui/components/paragraph';
import { formatHuf } from '@/utils/formatters/currency';
import { formatMonth } from '@/utils/formatters/date';

type Props = {
  events: PlanTimelineEntry[];
};

export const Timeline = ({ events }: Props) => {
  if (events.length <= 1) return null;

  return (
    <section className='flex flex-col gap-3'>
      <Heading as='h3'>Idővonal</Heading>
      <ol className='ml-2 flex flex-col gap-4 border-l pl-4'>
        {events.map((event) => (
          <li key={event.month}>
            <time dateTime={event.month}>
              <Paragraph as='span' size='xs' muted>
                {formatMonth(event.month)}
              </Paragraph>
            </time>
            {event.titles.map((title) => (
              <Paragraph key={title} weight='medium'>
                {title}
              </Paragraph>
            ))}
            <Paragraph size='sm' numeric>
              Havi törlesztő: {formatHuf(event.monthlyAfter)}
            </Paragraph>
          </li>
        ))}
      </ol>
    </section>
  );
};
