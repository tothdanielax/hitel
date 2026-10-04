import { Heading } from '@hitel/ui/components/typography';
import { formatHuf, formatMonth } from '@/utils/format';
import type { TimelineEvent } from '../utils/mock-result';

type Props = {
  events: TimelineEvent[];
};

export const Timeline = ({ events }: Props) => {
  return (
    <section className='flex flex-col gap-3'>
      <Heading as='h3'>Idővonal</Heading>
      <ol className='border-border ml-2 flex flex-col gap-4 border-l pl-4'>
        {events.map((event) => (
          <li key={`${event.month}-${event.title}`} className='flex flex-col'>
            <time dateTime={event.month} className='text-muted-foreground text-xs'>
              {formatMonth(event.month)}
            </time>
            <span className='font-medium'>{event.title}</span>
            <span className='text-sm tabular-nums'>
              Havi törlesztő utána: {formatHuf(event.monthlyAfter)}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
};
