import type { PlanTimelineEntry } from '@hitel/core/plan';
import { Heading } from '@hitel/ui/components/typography';
import { formatHuf } from '@/utils/currency';
import { formatMonth } from '@/utils/date';

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
          <li key={event.month} className='flex flex-col'>
            <time dateTime={event.month} className='text-muted-foreground text-xs'>
              {formatMonth(event.month)}
            </time>
            {event.titles.map((title) => (
              <span key={title} className='font-medium'>
                {title}
              </span>
            ))}
            <span className='text-sm tabular-nums'>
              Havi törlesztő: {formatHuf(event.monthlyAfter)}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
};
