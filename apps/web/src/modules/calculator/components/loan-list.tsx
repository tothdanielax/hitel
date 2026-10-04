import type { PlannedLoan } from '@hitel/core/plan';
import { MONTHS_PER_YEAR } from '@hitel/core/constants';
import { Heading } from '@hitel/ui/components/heading';
import { Paragraph } from '@hitel/ui/components/paragraph';
import { formatHuf } from '@/utils/formatters/currency';
import { formatPercent } from '@/utils/formatters/percent';
import { Stat } from './stat';

type Props = {
  loans: PlannedLoan[];
};

export const LoanList = ({ loans }: Props) => {
  if (loans.length === 0) return null;

  return (
    <section className='flex flex-col gap-3'>
      <Heading as='h3'>Hitelek</Heading>
      <ul className='flex flex-col gap-3'>
        {loans.map((loan) => (
          <li key={loan.id} className='flex flex-col gap-2 rounded-lg border p-3'>
            <div>
              <Paragraph weight='medium'>{loan.name}</Paragraph>
              <Paragraph size='xs' muted>
                {loan.note}
              </Paragraph>
            </div>
            <dl className='grid grid-cols-2 gap-2 sm:grid-cols-4'>
              <Stat label='Összeg' value={formatHuf(loan.amount)} />
              <Stat label='Kamat' value={formatPercent(loan.annualRate)} />
              <Stat
                label='Futamidő'
                value={`${Math.round(loan.termMonths / MONTHS_PER_YEAR)} év`}
              />
              <Stat label='Induló havi' value={formatHuf(loan.initialMonthly)} />
              <Stat label='Visszafizetés' value={formatHuf(loan.totalPaid)} />
              {loan.totalForgiven > 0 && (
                <Stat label='Elengedés' value={formatHuf(loan.totalForgiven)} />
              )}
            </dl>
          </li>
        ))}
      </ul>
    </section>
  );
};
