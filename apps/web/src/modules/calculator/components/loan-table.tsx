import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@hitel/ui/components/table';
import { formatHuf, formatPercent } from '@/utils/format';
import type { LoanLine } from '../utils/mock-result';

type Props = {
  loans: LoanLine[];
};

export const LoanTable = ({ loans }: Props) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Hitel</TableHead>
          <TableHead className='text-right'>Összeg</TableHead>
          <TableHead className='text-right'>Kamat</TableHead>
          <TableHead className='text-right'>Futamidő</TableHead>
          <TableHead className='text-right'>Havi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loans.map((loan) => (
          <TableRow key={loan.name}>
            <TableCell>
              <div className='font-medium'>{loan.name}</div>
              <div className='text-muted-foreground text-xs whitespace-normal'>{loan.note}</div>
            </TableCell>
            <TableCell className='text-right tabular-nums'>{formatHuf(loan.amount)}</TableCell>
            <TableCell className='text-right tabular-nums'>{formatPercent(loan.rate)}</TableCell>
            <TableCell className='text-right tabular-nums'>{loan.termYears} év</TableCell>
            <TableCell className='text-right tabular-nums'>{formatHuf(loan.monthly)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
