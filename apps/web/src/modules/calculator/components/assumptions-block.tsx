import { INPUT_LIMITS, LINKS, RATE_STEP } from '../constants';
import { ExternalLink } from './external-link';
import type { CalculatorForm } from '../hooks/use-calculator-form';
import { CSOK_PLUSZ, FALUSI_CSOK_LOAN } from '@hitel/core/constants';
import { formatPercent, inRange } from '@hitel/core/utils/math';
import { FormBlock } from './form-block';

type Props = {
  form: CalculatorForm;
};

const RATE_FIELDS = [
  {
    name: 'settings.bondYield',
    label: 'Állampapír hozam',
    description: (
      <>
        A megspórolt pénz alternatív hozama (pl. MÁP Plusz).{' '}
        <ExternalLink href={LINKS.bondCalculator}>Részletes kalkulátor</ExternalLink>
      </>
    ),
    limits: INPUT_LIMITS.rate
  },
  {
    name: 'settings.inflationRate',
    label: 'Várható infláció',
    description: 'Éves átlag',
    limits: INPUT_LIMITS.rate
  },
  {
    name: 'settings.repriceRate',
    label: 'Kamat a kamatperiódus után',
    description: 'Banki hitel kamata a fixálás lejárta után',
    limits: INPUT_LIMITS.rate
  },
  {
    name: 'settings.csokPluszRate',
    label: 'CSOK Plusz kamat',
    description: `Legfeljebb ${formatPercent(CSOK_PLUSZ.annualRate)}`,
    limits: { min: 0, max: CSOK_PLUSZ.annualRate }
  },
  {
    name: 'settings.falusiCsokLoanRate',
    label: 'Falusi CSOK-kölcsön kamat',
    description: `Legfeljebb ${formatPercent(FALUSI_CSOK_LOAN.annualRate)}`,
    limits: { min: 0, max: FALUSI_CSOK_LOAN.annualRate }
  }
] as const;

export const AssumptionsBlock = ({ form }: Props) => {
  return (
    <FormBlock
      title='Feltételezések'
      description='Alapértékek friss piaci adatokból, mind átírható'
    >
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        {RATE_FIELDS.map(({ name, label, description, limits }) => (
          <form.AppField
            key={name}
            name={name}
            validators={{ onChange: inRange(limits, formatPercent) }}
          >
            {(field) => (
              <field.NumberField label={label} description={description} step={RATE_STEP} percent />
            )}
          </form.AppField>
        ))}
      </div>
      <form.AppField name='settings.babavaroAsDownPayment'>
        {(field) => (
          <field.SwitchField
            label='Babaváró önerőként'
            description='Sok bank elfogadja, de bankfüggő. Kikapcsolva a kötelező önerőt saját pénzből kell fedezni.'
          />
        )}
      </form.AppField>
      <form.AppField name='settings.keepOwnFunds'>
        {(field) => (
          <field.SwitchField
            label='Önerő befektetése'
            description='Ha a hitel olcsóbb az állampapírhozamnál, inkább hitelt vesz fel, és az önerőt meghagyja befektetésre'
          />
        )}
      </form.AppField>
    </FormBlock>
  );
};
