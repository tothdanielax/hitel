import type { PlannedLoan } from '@hitel/core/plan';
import { Heading } from '@hitel/ui/components/typography';
import { formatHuf } from '@/utils/currency';
import { formatPercent } from '@/utils/percent';

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
              <p className='font-medium'>{loan.name}</p>
              <p className='text-muted-foreground text-xs'>{loan.note}</p>
            </div>
            <dl className='grid grid-cols-2 gap-2 text-sm sm:grid-cols-4'>
              <Item label='Összeg' value={formatHuf(loan.amount)} />
              <Item label='Kamat' value={formatPercent(loan.annualRate)} />
              <Item label='Futamidő' value={`${Math.round(loan.termMonths / 12)} év`} />
              <Item label='Induló havi' value={formatHuf(loan.initialMonthly)} />
              <Item label='Visszafizetés' value={formatHuf(loan.totalPaid)} />
              {loan.totalForgiven > 0 && (
                <Item label='Elengedés' value={formatHuf(loan.totalForgiven)} />
              )}
            </dl>
          </li>
        ))}
      </ul>
    </section>
  );
};

const Item = ({ label, value }: { label: string; value: string }) => {
  return (
    <div>
      <dt className='text-muted-foreground text-xs'>{label}</dt>
      <dd className='tabular-nums'>{value}</dd>
    </div>
  );
};
