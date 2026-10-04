import type { Plan } from '@hitel/core/plan';
import { Alert, AlertDescription, AlertTitle } from '@hitel/ui/components/alert';
import { Badge } from '@hitel/ui/components/reui/badge';
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
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@hitel/ui/components/empty';
import { ChevronDownIcon, LightbulbIcon, PiggyBankIcon } from 'lucide-react';
import { formatHuf } from '@hitel/core/utils/currency';
import { formatPercent, sum } from '@hitel/core/utils/math';
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
          {plan.loans.map((loan) => (
            <Badge key={loan.id} variant='secondary' radius='full'>
              {loan.name}
            </Badge>
          ))}
        </CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        {plan.loans.length === 0 && (
          <Empty className='border'>
            <EmptyHeader>
              <EmptyMedia variant='icon'>
                <PiggyBankIcon />
              </EmptyMedia>
              <EmptyTitle>Nincs szükség hitelre</EmptyTitle>
              <EmptyDescription>Az önerő és a támogatások fedezik a vételárat.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
        <dl className='grid grid-cols-1 gap-4 min-[380px]:grid-cols-2'>
          <Stat
            emphasis
            label='Szükséges hitelösszeg'
            value={formatHuf(sum(plan.loans.map((loan) => loan.amount)))}
          />
          <Stat emphasis label='Állami támogatás' value={formatHuf(plan.subsidy)} />
          <Stat
            emphasis
            label='Induló havi törlesztő'
            value={formatHuf(plan.schedule.initialMonthly)}
          />
          <Stat
            emphasis
            label='Átlagos havi törlesztő'
            value={formatHuf(plan.schedule.averageMonthly)}
          />
          <Stat emphasis label='Teljes visszafizetés' value={formatHuf(plan.schedule.totalPaid)} />
          <Stat
            emphasis
            label='Visszafizetés mai pénzben'
            value={formatHuf(plan.schedule.realTotalPaid)}
            hint='Inflációval mai forintra átszámolva, mert a későbbi törlesztők ma kevesebbet érnek'
          />
          <Stat emphasis label='Illeték' value={formatHuf(plan.stampDuty)} />
          <Stat emphasis label='Felhasznált önerő' value={formatHuf(plan.ownFundsUsed)} />
          {plan.cashKept > 0 && (
            <Stat
              emphasis
              label='Befektethető összeg'
              value={formatHuf(plan.cashKept)}
              hint='Megtartott önerő és a Babaváró fel nem használt része. Állampapírban vagy ETF-ben többet hoz, mint amennyibe a hitel kerül, a rangsor ezzel is számol.'
            />
          )}
          {plan.cashKept > 0 && (
            <>
              <Stat
                emphasis
                label='Induló befektetési hozam'
                value={`${formatHuf(plan.investmentReturn.initialMonthly)} / hó`}
                hint='Az első évben havonta: a befektethető összeg az állampapírhozammal (adó és infláció nélkül).'
              />
              <Stat
                emphasis
                label='Átlagos befektetési hozam'
                value={`${formatHuf(plan.investmentReturn.monthlyAverage)} / hó`}
                hint={`A futamidő alatti havi átlag, évente tőkésítve: összesen ${formatHuf(plan.investmentReturn.total)} hozam (adó és infláció nélkül).`}
              />
            </>
          )}
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
