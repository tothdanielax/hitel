import type { PlanTimelineEntry } from '@hitel/core/plan';
import { Marker } from '@hitel/ui/components/marker';
import {
  Timeline as TimelineRoot,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle
} from '@hitel/ui/components/reui/timeline';
import { formatHuf } from '@hitel/core/utils/currency';
import { formatMonth } from '@hitel/core/utils/date';

type Props = {
  events: PlanTimelineEntry[];
};

// Wide screens put the date in a left column, narrow ones above the title.
const SIDE_DATE =
  'sm:group-data-[orientation=vertical]/timeline:absolute sm:group-data-[orientation=vertical]/timeline:-left-32 sm:group-data-[orientation=vertical]/timeline:w-20 sm:group-data-[orientation=vertical]/timeline:text-right';

export const Timeline = ({ events }: Props) => {
  if (events.length <= 1) return null;

  return (
    <section className='flex flex-col gap-3'>
      <Marker variant='separator' render={<h3 />}>
        Idővonal
      </Marker>
      <TimelineRoot defaultValue={1}>
        {events.map((event, index) => (
          <TimelineItem
            key={event.month}
            step={index + 1}
            className='sm:group-data-[orientation=vertical]/timeline:ms-32'
          >
            <TimelineHeader>
              <TimelineSeparator />
              <TimelineDate dateTime={event.month} className={SIDE_DATE}>
                {formatMonth(event.month)}
              </TimelineDate>
              <div className='flex flex-col gap-2 sm:-mt-0.5'>
                {event.items.map((item) => (
                  <div key={item.title}>
                    <TimelineTitle>{item.title}</TimelineTitle>
                    {item.details.length > 0 && (
                      <ul className='list-disc pl-4 text-sm'>
                        {item.details.map((detail) => (
                          <li key={detail}>{detail}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
              <TimelineIndicator />
            </TimelineHeader>
            <TimelineContent className='tabular-nums'>
              Havi törlesztő: {formatHuf(event.monthlyAfter)}
            </TimelineContent>
          </TimelineItem>
        ))}
      </TimelineRoot>
    </section>
  );
};
