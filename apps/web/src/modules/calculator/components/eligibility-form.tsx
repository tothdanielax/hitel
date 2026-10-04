import type { CalculatorForm } from '../hooks/use-calculator-form';
import { ApplicantsBlock } from './applicants-block';
import { AssumptionsBlock } from './assumptions-block';
import { BankOffersBlock } from './bank-offers-block';
import { FamilyBlock } from './family-block';
import { FinancesBlock } from './finances-block';
import { PropertyBlock } from './property-block';

type Props = {
  form: CalculatorForm;
};

export const EligibilityForm = ({ form }: Props) => {
  return (
    <form className='flex flex-col gap-4' onSubmit={(event) => event.preventDefault()} noValidate>
      <ApplicantsBlock form={form} />
      <FamilyBlock form={form} />
      <PropertyBlock form={form} />
      <FinancesBlock form={form} />
      <AssumptionsBlock form={form} />
      <BankOffersBlock form={form} />
    </form>
  );
};
