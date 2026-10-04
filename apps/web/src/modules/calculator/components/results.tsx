import type { Plan } from '@hitel/core/plan';
import { Alert, AlertDescription, AlertTitle } from '@hitel/ui/components/alert';
import { Badge } from '@hitel/ui/components/badge';
import { Button } from '@hitel/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@hitel/ui/components/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@hitel/ui/components/collapsible';
import { Paragraph } from '@hitel/ui/components/typography';
import { ChevronDownIcon, LightbulbIcon } from 'lucide-react';
import { formatHuf } from '@/utils/currency';
import { formatPercent } from '@/utils/percent';
import { Eligibilities } from './eligibilities';
import { LoanList } from './loan-list';
import { Timeline } from './timeline';

type Props = {
  plan: Plan;
};

export const Results = ({ plan }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Legjobb kombináció</CardTitle>
        <CardDescription className='flex flex-wrap gap-1'>
          {plan.loans.length === 0 && 'Nincs szükség hitelre'}
          {plan.loans.map((loan) => (
            <Badge key={loan.id} variant='secondary'>
              {loan.name}
            </Badge>
          ))}
        </CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        <dl className='grid grid-cols-1 gap-4 min-[380px]:grid-cols-2'>
          <Stat label='Átlagos havi törlesztő' value={formatHuf(plan.schedule.averageMonthly)} />
          <Stat label='Teljes visszafizetés' value={formatHuf(plan.schedule.totalPaid)} />
          <Stat label='Visszafizetés mai értéken' value={formatHuf(plan.schedule.realTotalPaid)} />
          <Stat label='Induló havi törlesztő' value={formatHuf(plan.schedule.initialMonthly)} />
          <Stat label='Állami támogatás' value={formatHuf(plan.subsidy)} />
          <Stat label='Illeték' value={formatHuf(plan.stampDuty)} />
          <Stat
            label='Törlesztő / jövedelem (JTM)'
            value={`${formatPercent(plan.paymentToIncome)} / ${formatPercent(plan.paymentToIncomeLimit)}`}
          />
        </dl>
        {plan.warnings.map((warning) => (
          <Alert key={warning}>
            <AlertDescription>{warning}</AlertDescription>
          </Alert>
        ))}
        {plan.tips.length > 0 && (
          <Alert>
            <LightbulbIcon />
            <AlertTitle>Tippek</AlertTitle>
            <AlertDescription>
              <ul className='list-disc pl-4'>
                {plan.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        <Collapsible>
          <CollapsibleTrigger render={<Button variant='outline' className='group w-full' />}>
            Részletek és idővonal
            <ChevronDownIcon className='transition-transform group-data-panel-open:rotate-180' />
          </CollapsibleTrigger>
          <CollapsibleContent className='flex flex-col gap-6 pt-4'>
            <LoanList loans={plan.loans} />
            <Timeline events={plan.timeline} />
            <Eligibilities eligibility={plan.eligibility} />
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className='flex flex-col gap-1'>
      <dt>
        <Paragraph size='sm' muted>
          {label}
        </Paragraph>
      </dt>
      <dd className='text-xl font-semibold tabular-nums sm:text-2xl'>{value}</dd>
    </div>
  );
};
