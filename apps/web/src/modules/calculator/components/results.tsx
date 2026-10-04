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
import { ChevronDownIcon, LightbulbIcon } from 'lucide-react';
import { formatHuf } from '@hitel/core/utils/currency';
import { formatPercent } from '@hitel/core/utils/math';
import { Eligibilities } from './eligibilities';
import { LoanList } from './loan-list';
import { Stat } from './stat';
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
          <Stat
            emphasis
            label='Átlagos havi törlesztő'
            value={formatHuf(plan.schedule.averageMonthly)}
          />
          <Stat emphasis label='Teljes visszafizetés' value={formatHuf(plan.schedule.totalPaid)} />
          <Stat
            emphasis
            label='Visszafizetés mai értéken'
            value={formatHuf(plan.schedule.realTotalPaid)}
          />
          <Stat
            emphasis
            label='Induló havi törlesztő'
            value={formatHuf(plan.schedule.initialMonthly)}
          />
          <Stat emphasis label='Állami támogatás' value={formatHuf(plan.subsidy)} />
          <Stat emphasis label='Illeték' value={formatHuf(plan.stampDuty)} />
          <Stat
            emphasis
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
