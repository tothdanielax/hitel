import { OTTHON_START } from '@hitel/core/constants';
import { useStore } from '@tanstack/react-form';
import { formatHuf } from '@hitel/core/utils/currency';
import { formatPercent, inRange } from '@hitel/core/utils/math';
import { INPUT_LIMITS, RELATIONSHIP_OPTIONS } from '../constants';
import type { CalculatorForm } from '../hooks/use-calculator-form';
import { FormBlock } from './form-block';

type Props = {
  form: CalculatorForm;
};

export const ApplicantsBlock = ({ form }: Props) => {
  const relationship = useStore(form.store, (state) => state.values.relationship);
  const isMarried = relationship === 'MARRIED';

  return (
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
            description={`Az elmúlt ${OTTHON_START.priorOwnershipLookbackYears} évben nem volt lakástulajdonotok (${formatHuf(OTTHON_START.priorPropertyIgnoredBelow)} alatti érték vagy legfeljebb ${formatPercent(OTTHON_START.priorOwnershipMaxShare)}-os tulajdonrész nem számít)`}
          />
        )}
      </form.AppField>
      <form.AppField name='cleanRecord'>
        {(field) => <field.SwitchField label='Büntetlen előélet' />}
      </form.AppField>
    </FormBlock>
  );
};
