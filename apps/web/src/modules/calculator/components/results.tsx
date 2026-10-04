import { Alert, AlertDescription } from '@hitel/ui/components/alert';
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
import { ChevronDownIcon } from 'lucide-react';
import { formatHuf } from '@/utils/format';
import type { CalculationResult } from '../utils/mock-result';
import { LoanTable } from './loan-table';
import { Timeline } from './timeline';

type Props = {
  result: CalculationResult;
};

export const Results = ({ result }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Legjobb kombináció</CardTitle>
        <CardDescription>
          {result.loans.map((loan) => (
            <Badge key={loan.name} variant='secondary' className='mr-1'>
              {loan.name}
            </Badge>
          ))}
        </CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        <dl className='grid grid-cols-2 gap-4'>
          <Stat label='Átlagos havi törlesztő' value={result.averageMonthly} />
          <Stat label='Teljes visszafizetés' value={result.totalRepayment} />
          <Stat label='Induló havi törlesztő' value={result.initialMonthly} />
          <Stat label='Állami támogatás' value={result.totalSubsidy} />
        </dl>
        {result.warnings.map((warning) => (
          <Alert key={warning}>
            <AlertDescription>{warning}</AlertDescription>
          </Alert>
        ))}
        <Collapsible>
          <CollapsibleTrigger render={<Button variant='outline' className='w-full' />}>
            Részletek és idővonal
            <ChevronDownIcon />
          </CollapsibleTrigger>
          <CollapsibleContent className='flex flex-col gap-6 pt-4'>
            <LoanTable loans={result.loans} />
            <Timeline events={result.timeline} />
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

const Stat = ({ label, value }: { label: string; value: number }) => {
  return (
    <div>
      <dt>
        <Paragraph size='sm' muted>
          {label}
        </Paragraph>
      </dt>
      <dd className='text-2xl font-semibold tabular-nums'>{formatHuf(value)}</dd>
    </div>
  );
};
