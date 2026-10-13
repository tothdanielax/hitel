import { OTTHON_START } from '@hitel/core/constants';
import { useStore } from '@tanstack/react-form';
import { formatHuf } from '@hitel/core/utils/currency';
import { formatPercent, inRange } from '@hitel/core/utils/math';
import { EXCLUDABLE_OPTIONS, INPUT_LIMITS, MONTH_RANGE, RELATIONSHIP_OPTIONS } from '../constants';
import type { CalculatorForm } from '../hooks/use-calculator-form';
import { FormBlock } from './form-block';

type Props = {
  form: CalculatorForm;
};

export const ApplicantsBlock = ({ form }: Props) => {
  const relationship = useStore(form.store, (state) => state.values.relationship);
  const plannedMarriage = useStore(form.store, (state) => state.values.plannedMarriageMonth);
  const isMarried = relationship === 'MARRIED';
  // Family programs read only the wife's age.
  const ageLabel = isMarried
    ? 'Feleség életkora'
    : plannedMarriage
      ? 'Leendő feleség életkora'
      : 'Életkorod';

  return (
    <FormBlock title='Igénylők' description='Családi állapot, életkor és jogviszony'>
      <form.AppField name='relationship'>
        {(field) => <field.ChoiceField label='Családi állapot' options={RELATIONSHIP_OPTIONS} />}
      </form.AppField>
      <form.AppField name='applicantAge' validators={{ onChange: inRange(INPUT_LIMITS.age) }}>
        {(field) => <field.NumberField label={ageLabel} unit='év' />}
      </form.AppField>
      {!isMarried && (
        <form.AppField name='plannedMarriageMonth'>
          {(field) => (
            <field.MonthField
              label='Tervezett házasságkötés'
              description='Ha van: a Babaváró és a CSOK Plusz házassághoz kötött'
              range={MONTH_RANGE.planned}
              clearable
            />
          )}
        </form.AppField>
      )}
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
      <form.AppField name='excludedPrograms' mode='array'>
        {(field) => (
          <field.CheckboxListField
            label='Kizárt támogatások'
            description='Amit már igénybe vettetek (a legtöbb csak egyszer jár) vagy nem szeretnétek'
            options={EXCLUDABLE_OPTIONS}
          />
        )}
      </form.AppField>
    </FormBlock>
  );
};
