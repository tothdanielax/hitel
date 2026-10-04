import { useStore } from '@tanstack/react-form';
import { TERM_YEARS } from '@hitel/core/constants';
import {
  INPUT_LIMITS,
  PROPERTY_CONDITION_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  RELATIONSHIP_OPTIONS,
  SETTLEMENT_OPTIONS
} from '../constants';
import type { CalculatorForm } from '../hooks/use-calculator-form';
import { FormBlock } from './form-block';

type Props = {
  form: CalculatorForm;
};

export const EligibilityForm = ({ form }: Props) => {
  const relationship = useStore(form.store, (state) => state.values.relationship);
  const isMarried = relationship === 'MARRIED';

  return (
    <form className='flex flex-col gap-4' onSubmit={(event) => event.preventDefault()} noValidate>
      <FormBlock title='Igénylők' description='Családi állapot, életkor és jogviszony'>
        <form.AppField name='relationship'>
          {(field) => <field.ChoiceField label='Családi állapot' options={RELATIONSHIP_OPTIONS} />}
        </form.AppField>
        <div className='flex flex-col gap-4 sm:flex-row'>
          <form.AppField name='applicantAge' validators={{ onChange: inRange(INPUT_LIMITS.age) }}>
            {(field) => (
              <field.NumberField label={isMarried ? 'Feleség életkora' : 'Életkorod'} unit='év' />
            )}
          </form.AppField>
          {relationship !== 'SINGLE' && (
            <form.AppField name='partnerAge' validators={{ onChange: inRange(INPUT_LIMITS.age) }}>
              {(field) => (
                <field.NumberField
                  label={isMarried ? 'Férj életkora' : 'Társad életkora'}
                  unit='év'
                />
              )}
            </form.AppField>
          )}
        </div>
        <form.AppField
          name='insuredYears'
          validators={{ onChange: inRange(INPUT_LIMITS.insuredYears) }}
        >
          {(field) => (
            <field.NumberField
              label='Folyamatos TB jogviszony'
              unit='év'
              description='Házaspárnál elég az egyik félnek'
            />
          )}
        </form.AppField>
        <form.AppField name='firstHome'>
          {(field) => (
            <field.SwitchField
              label='Első lakás'
              description='Az elmúlt 10 évben nem volt lakástulajdonotok (15 millió Ft alatti vagy 50%-os rész nem számít)'
            />
          )}
        </form.AppField>
        <form.AppField name='cleanRecord'>
          {(field) => <field.SwitchField label='Büntetlen előélet' />}
        </form.AppField>
      </FormBlock>

      <FormBlock
        title='Gyermekek és családtervezés'
        description='A támogatások jelentős része a gyermekek számától és születési idejétől függ'
      >
        <form.AppField name='childrenBirthMonths' mode='array'>
          {(field) => (
            <field.MonthListField
              label='Meglévő gyermekek'
              description='Születési hónap'
              addLabel='Gyermek hozzáadása'
            />
          )}
        </form.AppField>
        <form.AppField name='pregnant'>
          {(field) => (
            <field.SwitchField label='Várandósság' description='Legalább 12. hetes magzat' />
          )}
        </form.AppField>
        <form.AppField name='plannedChildrenMonths' mode='array'>
          {(field) => (
            <field.MonthListField
              label='Tervezett gyermekek'
              description='Várható születési hónap (a várandósság is ide tartozik)'
              addLabel='Tervezett gyermek'
            />
          )}
        </form.AppField>
      </FormBlock>

      <FormBlock title='Ingatlan' description='Vételár, típus, állapot és elhelyezkedés'>
        <div className='flex flex-col gap-4 sm:flex-row'>
          <form.AppField
            name='propertyPrice'
            validators={{ onChange: inRange(INPUT_LIMITS.money) }}
          >
            {(field) => <field.NumberField label='Vételár' unit='Ft' step={1_000_000} />}
          </form.AppField>
          <form.AppField
            name='propertySize'
            validators={{ onChange: inRange(INPUT_LIMITS.propertySize) }}
          >
            {(field) => <field.NumberField label='Hasznos alapterület' unit='m²' />}
          </form.AppField>
        </div>
        <form.AppField name='propertyType'>
          {(field) => <field.ChoiceField label='Típus' options={PROPERTY_TYPE_OPTIONS} />}
        </form.AppField>
        <form.AppField name='propertyCondition'>
          {(field) => <field.ChoiceField label='Állapot' options={PROPERTY_CONDITION_OPTIONS} />}
        </form.AppField>
        <form.AppField name='settlementType'>
          {(field) => <field.ChoiceField label='Település' options={SETTLEMENT_OPTIONS} />}
        </form.AppField>
      </FormBlock>

      <FormBlock title='Pénzügyek' description='Önerő, jövedelem és futamidő'>
        <div className='flex flex-col gap-4 sm:flex-row'>
          <form.AppField name='ownFunds' validators={{ onChange: inRange(INPUT_LIMITS.money) }}>
            {(field) => <field.NumberField label='Önerő' unit='Ft' step={500_000} />}
          </form.AppField>
          <form.AppField
            name='netIncome'
            validators={{ onChange: inRange(INPUT_LIMITS.netIncome) }}
          >
            {(field) => (
              <field.NumberField label='Háztartás nettó jövedelme' unit='Ft / hó' step={50_000} />
            )}
          </form.AppField>
        </div>
        <form.AppField name='termYears' validators={{ onChange: inRange(TERM_YEARS) }}>
          {(field) => (
            <field.NumberField
              label='Futamidő'
              unit='év'
              min={TERM_YEARS.min}
              max={TERM_YEARS.max}
            />
          )}
        </form.AppField>
        <form.AppField name='startMonth'>
          {(field) => <field.MonthField label='Tervezett folyósítás' />}
        </form.AppField>
      </FormBlock>

      <FormBlock
        title='Feltételezések'
        description='A hitelek összevetéséhez és a mai értékhez használt hozam és infláció'
      >
        <div className='flex flex-col gap-4 sm:flex-row'>
          <form.AppField name='bondYield' validators={{ onChange: inRange(INPUT_LIMITS.rate) }}>
            {(field) => (
              <field.NumberField
                label='Állampapír hozam'
                unit='%'
                step={0.1}
                max={INPUT_LIMITS.rate.max}
                percent
                description='A megspórolt pénz alternatív hozama (pl. MÁP Plusz)'
              />
            )}
          </form.AppField>
          <form.AppField name='inflationRate' validators={{ onChange: inRange(INPUT_LIMITS.rate) }}>
            {(field) => (
              <field.NumberField
                label='Várható infláció'
                unit='% / év'
                step={0.1}
                max={INPUT_LIMITS.rate.max}
                percent
              />
            )}
          </form.AppField>
        </div>
      </FormBlock>
    </form>
  );
};

const inRange = ({ min, max }: { min: number; max: number }) => {
  return ({ value }: { value: number }): string | undefined => {
    return value < min || value > max ? `${min} és ${max} közötti érték` : undefined;
  };
};
