import {
  INPUT_LIMITS,
  MONEY_STEP,
  PROPERTY_CONDITION_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  SETTLEMENT_OPTIONS,
  LINKS
} from '../constants';
import { ExternalLink } from './external-link';
import type { CalculatorForm } from '../hooks/use-calculator-form';
import { inRange } from '@hitel/core/utils/math';
import { useStore } from '@tanstack/react-form';
import { FormBlock } from './form-block';

type Props = {
  form: CalculatorForm;
};

export const PropertyBlock = ({ form }: Props) => {
  const firstHome = useStore(form.store, (state) => state.values.firstHome);

  return (
    <FormBlock title='Ingatlan' description='Vételár, típus, állapot és elhelyezkedés'>
      <div className='flex flex-col gap-4 sm:flex-row'>
        <form.AppField name='propertyPrice' validators={{ onChange: inRange(INPUT_LIMITS.money) }}>
          {(field) => <field.NumberField label='Vételár' unit='Ft' step={MONEY_STEP.price} />}
        </form.AppField>
        <form.AppField
          name='propertySize'
          validators={{ onChange: inRange(INPUT_LIMITS.propertySize) }}
        >
          {(field) => <field.NumberField label='Hasznos alapterület' unit='m²' />}
        </form.AppField>
      </div>
      <form.AppField name='renovationBudget' validators={{ onChange: inRange(INPUT_LIMITS.money) }}>
        {(field) => (
          <field.NumberField
            label='Tervezett felújítás'
            unit='Ft'
            step={MONEY_STEP.renovation}
            description='Otthon Start és CSOK Plusz nem fedezheti, csak önerő, Babaváró, banki lakáshitel vagy falusi CSOK'
          />
        )}
      </form.AppField>
      {!firstHome && (
        <form.AppField name='soldHomeValue' validators={{ onChange: inRange(INPUT_LIMITS.money) }}>
          {(field) => (
            <field.NumberField
              label='Eladott vagy eladandó lakás értéke'
              unit='Ft'
              step={MONEY_STEP.price}
              description='Ha a vásárlás előtt 5 éven belül (olcsóbb új lakásnál 3 éven belül) vagy utána 1 éven belül adod el, csak a különbözet után van illeték. CSOK Plusznál az új lakás legyen drágább. Az eladási árat az önerőnél is add meg.'
            />
          )}
        </form.AppField>
      )}
      <form.AppField name='propertyType'>
        {(field) => <field.ChoiceField label='Típus' options={PROPERTY_TYPE_OPTIONS} />}
      </form.AppField>
      <form.AppField name='propertyCondition'>
        {(field) => <field.ChoiceField label='Állapot' options={PROPERTY_CONDITION_OPTIONS} />}
      </form.AppField>
      <form.AppField name='energyEfficient'>
        {(field) => (
          <field.SwitchField
            label='Energiahatékony (legalább A+)'
            description='Zöld hitellel 90% hitelfedezet és 60% JTM, ha a kamat legalább 10 évre fix. A zöld hitelek kamata általában 0,25-0,5 ponttal alacsonyabb, a Banki ajánlatoknál átírható.'
          />
        )}
      </form.AppField>
      <form.AppField name='settlementType'>
        {(field) => (
          <field.ChoiceField
            label='Település'
            options={SETTLEMENT_OPTIONS}
            description={
              <>
                Falusi CSOK csak kedvezményezett kistelepülésen jár, a listát a{' '}
                <ExternalLink href={LINKS.falusiCsokSettlements}>
                  302/2023. Korm. rendelet melléklete
                </ExternalLink>{' '}
                tartalmazza.
              </>
            }
          />
        )}
      </form.AppField>
    </FormBlock>
  );
};
