import { Button } from '@hitel/ui/components/button';
import { Calendar } from '@hitel/ui/components/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@hitel/ui/components/popover';
import { currentMonth, dateToMonth, formatMonth, monthToDate } from '@hitel/core/utils/date';
import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';

type Props = {
  id?: string;
  value: string;
  // ISO months bounding the selectable range.
  from: string;
  to: string;
  'aria-label'?: string;
  onChange: (month: string) => void;
};

// Picks a day on the shadcn calendar but keeps only its month.
export const MonthPicker = ({ id, value, from, to, onChange, ...props }: Props) => {
  const [open, setOpen] = useState(false);
  const selected = value ? monthToDate(value) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            type='button'
            variant='outline'
            className='w-full min-w-0 shrink justify-between font-normal'
            aria-label={props['aria-label']}
          />
        }
      >
        {value ? formatMonth(value) : 'Válassz hónapot'}
        <CalendarIcon />
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar
          mode='single'
          captionLayout='dropdown'
          selected={selected}
          defaultMonth={selected ?? monthToDate(clampMonth(currentMonth(), from, to))}
          startMonth={monthToDate(from)}
          endMonth={monthToDate(to)}
          onSelect={(date) => {
            if (!date) return;
            onChange(dateToMonth(date));
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

// ISO months sort as strings.
const clampMonth = (month: string, from: string, to: string): string => {
  return month < from ? from : month > to ? to : month;
};
