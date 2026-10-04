import type { CalculatorForm } from '../hooks/use-calculator-form';
import { ChoiceField } from './choice-field';
import { FormBlock } from './form-block';
import { MonthListField } from './month-list-field';
import { NumberField } from './number-field';
import { SwitchField } from './switch-field';

type Props = {
  form: CalculatorForm;
  update: <K extends keyof CalculatorForm>(key: K, value: CalculatorForm[K]) => void;
};

export const EligibilityForm = ({ form, update }: Props) => {
  return (
    <form className='flex flex-col gap-4' onSubmit={(event) => event.preventDefault()}>
      <FormBlock title='Igénylők' description='Életkor, családi állapot és jogviszony'>
        <ChoiceField
          label='Családi állapot'
          value={form.relationship}
          options={{ single: 'Egyedülálló', married: 'Házaspár', partners: 'Élettársak' }}
          onChange={(value) => update('relationship', value)}
        />
        <div className='flex gap-4'>
          <NumberField
            label='Életkorod'
            unit='év'
            value={form.applicantAge}
            onChange={(value) => update('applicantAge', value)}
          />
          {form.relationship !== 'single' && (
            <NumberField
              label='Társad életkora'
              unit='év'
              value={form.partnerAge}
              onChange={(value) => update('partnerAge', value)}
            />
          )}
        </div>
        <NumberField
          label='Folyamatos TB jogviszony'
          unit='év'
          value={form.insuredYears}
          onChange={(value) => update('insuredYears', value)}
        />
        <SwitchField
          label='Első lakás'
          description='Nincs és nem is volt lakástulajdonod'
          checked={form.firstHome}
          onChange={(value) => update('firstHome', value)}
        />
        <SwitchField
          label='Büntetlen előélet'
          checked={form.cleanRecord}
          onChange={(value) => update('cleanRecord', value)}
        />
      </FormBlock>

      <FormBlock
        title='Gyermekek és családtervezés'
        description='A támogatások jelentős része a gyermekek számától és születési idejétől függ'
      >
        <MonthListField
          label='Meglévő gyermekek'
          description='Születési hónap'
          addLabel='Gyermek hozzáadása'
          months={form.childrenBirthMonths}
          onChange={(value) => update('childrenBirthMonths', value)}
        />
        <SwitchField
          label='Várandósság'
          description='Legalább 12. hetes magzat'
          checked={form.pregnant}
          onChange={(value) => update('pregnant', value)}
        />
        <MonthListField
          label='Tervezett gyermekek'
          description='Várható születési hónap, ha terveztek gyermeket'
          addLabel='Tervezett gyermek'
          months={form.plannedChildrenMonths}
          onChange={(value) => update('plannedChildrenMonths', value)}
        />
      </FormBlock>

      <FormBlock title='Ingatlan' description='Vételár, állapot és elhelyezkedés'>
        <NumberField
          label='Vételár'
          unit='Ft'
          step={1_000_000}
          value={form.propertyPrice}
          onChange={(value) => update('propertyPrice', value)}
        />
        <NumberField
          label='Alapterület'
          unit='m²'
          value={form.propertySize}
          onChange={(value) => update('propertySize', value)}
        />
        <ChoiceField
          label='Állapot'
          value={form.propertyCondition}
          options={{ new: 'Új építésű', used: 'Használt' }}
          onChange={(value) => update('propertyCondition', value)}
        />
        <ChoiceField
          label='Település'
          value={form.settlementType}
          options={{
            budapest: 'Budapest',
            city: 'Város',
            village: 'Falusi CSOK település'
          }}
          onChange={(value) => update('settlementType', value)}
        />
      </FormBlock>

      <FormBlock title='Pénzügyek' description='Önerő, jövedelem és futamidő'>
        <NumberField
          label='Önerő'
          unit='Ft'
          step={500_000}
          value={form.ownFunds}
          onChange={(value) => update('ownFunds', value)}
        />
        <NumberField
          label='Háztartás nettó havi jövedelme'
          unit='Ft'
          step={50_000}
          description='A jövedelemarányos törlesztőrészlet (JTM) korláthoz'
          value={form.netIncome}
          onChange={(value) => update('netIncome', value)}
        />
        <NumberField
          label='Futamidő'
          unit='év'
          value={form.termYears}
          onChange={(value) => update('termYears', value)}
        />
      </FormBlock>
    </form>
  );
};
