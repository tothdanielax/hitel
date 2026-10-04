import type { MarriageOutlook as Outlook } from '@hitel/core/plan';
import { PREPAYMENT_FEE_RATE } from '@hitel/core/constants';
import { Alert, AlertDescription, AlertTitle } from '@hitel/ui/components/alert';
import { formatHuf } from '@hitel/core/utils/currency';
import { formatMonth } from '@hitel/core/utils/date';
import { formatPercent } from '@hitel/core/utils/math';
import { HeartIcon } from 'lucide-react';

type Props = {
  outlook: Outlook;
};

export const MarriageOutlook = ({ outlook }: Props) => {
  const { babavaro, buyAfter } = outlook;
  const waitingSaves = buyAfter.costNow - buyAfter.costAfter;

  return (
    <Alert>
      <HeartIcon />
      <AlertTitle>Házasság után ({formatMonth(outlook.month)})</AlertTitle>
      <AlertDescription>
        <ul className='list-disc pl-4'>
          <li>
            A meglévő hitel nem forgatható át Otthon Startba vagy CSOK Pluszba: ezek csak vásárlásra
            járnak.
          </li>
          {babavaro ? (
            <li>
              {formatHuf(babavaro.amount)} Babaváró igényelhető.{' '}
              {babavaro.use === 'PREPAY'
                ? `Érdemes vele előtörleszteni: ${babavaro.target} (${formatPercent(PREPAYMENT_FEE_RATE)} díjjal).`
                : 'Érdemes befektetni, mert a meglévő hitelek olcsóbbak az állampapírhozamnál.'}{' '}
              Nyereség jelenértéken: {formatHuf(babavaro.gain)}.
            </li>
          ) : (
            <li>
              Babaváró nem jár: 35 év alatti feleség és 5 éven belüli gyermekvállalás kell hozzá.
            </li>
          )}
          <li>
            Ha csak a házasság után vásárolnátok: {buyAfter.loans.join(', ') || 'hitel nélkül'},
            átlagosan {formatHuf(buyAfter.averageMonthly)} havonta. Ez jelenértéken{' '}
            {formatHuf(Math.abs(waitingSaves))}-tal {waitingSaves > 0 ? 'olcsóbb' : 'drágább'}, de a
            várakozás alatti albérlet nincs benne.
          </li>
        </ul>
      </AlertDescription>
    </Alert>
  );
};
