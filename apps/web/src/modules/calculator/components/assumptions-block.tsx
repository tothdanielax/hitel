import { INPUT_LIMITS, RATE_STEP } from '../constants';
import type { CalculatorForm } from '../hooks/use-calculator-form';
import { inRange } from '../utils/validators';
import { FormBlock } from './form-block';

type Props = {
  form: CalculatorForm;
};

const RATE_FIELDS = [
  {
    name: 'settings.bondYield',
    label: 'Állampapír hozam',
    description: 'A megspórolt pénz alternatív hozama (pl. MÁP Plusz)'
  },
  { name: 'settings.inflationRate', label: 'Várható infláció', description: 'Éves átlag' },
  {
    name: 'settings.repriceRate',
    label: 'Kamat a kamatperiódus után',
    description: 'Banki hitel kamata a fixálás lejárta után'
  },
  { name: 'settings.csokPluszRate', label: 'CSOK Plusz kamat', description: 'Legfeljebb 3%' },
  {
    name: 'settings.falusiCsokLoanRate',
    label: 'Falusi CSOK-kölcsön kamat',
    description: 'Legfeljebb 3%'
  }
] as const;

export const AssumptionsBlock = ({ form }: Props) => {
  return (
    <FormBlock
      title='Feltételezések'
      description='Alapértékek friss piaci adatokból, mind átírható'
    >
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        {RATE_FIELDS.map(({ name, label, description }) => (
          <form.AppField
            key={name}
            name={name}
            validators={{ onChange: inRange(INPUT_LIMITS.rate) }}
          >
            {(field) => (
              <field.NumberField
                label={label}
                unit='%'
                description={description}
                step={RATE_STEP}
                max={INPUT_LIMITS.rate.max}
                percent
              />
            )}
          </form.AppField>
        ))}
      </div>
    </FormBlock>
  );
};
