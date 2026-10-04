import type { PlannedLoan } from '@hitel/core/plan';
import { MONTHS_PER_YEAR } from '@hitel/core/constants';
import { Marker } from '@hitel/ui/components/marker';
import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
  FrameTitle
} from '@hitel/ui/components/reui/frame';
import { formatHuf } from '@hitel/core/utils/currency';
import { formatPercent } from '@hitel/core/utils/math';
import { Stat } from './stat';

type Props = {
  loans: PlannedLoan[];
};

export const LoanList = ({ loans }: Props) => {
  if (loans.length === 0) return null;

  return (
    <section className='flex flex-col gap-3'>
      <Marker variant='separator' render={<h3 />}>
        Hitelek
      </Marker>
      {loans.map((loan) => (
        <Frame key={loan.id} spacing='sm'>
          <FrameHeader>
            <FrameTitle>{loan.name}</FrameTitle>
            <FrameDescription>{loan.note}</FrameDescription>
          </FrameHeader>
          <FramePanel>
            <dl className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
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
          </FramePanel>
        </Frame>
      ))}
    </section>
  );
};
