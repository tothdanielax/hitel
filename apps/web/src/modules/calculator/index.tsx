import { Heading, Paragraph } from '@hitel/ui/components/typography';
import { APP_DESCRIPTION, APP_NAME } from '@/constants';
import { EligibilityForm } from './components/eligibility-form';
import { Results } from './components/results';
import { useCalculatorForm } from './hooks/use-calculator-form';
import { MOCK_RESULT } from './utils/mock-result';

export const Calculator = () => {
  const { form, update } = useCalculatorForm();

  return (
    <main className='mx-auto flex max-w-6xl flex-col gap-6 p-4 md:p-8'>
      <header>
        <Heading as='h1'>{APP_NAME}</Heading>
        <Paragraph muted>{APP_DESCRIPTION}</Paragraph>
      </header>
      <div className='flex flex-col gap-6 lg:flex-row lg:items-start'>
        <section className='lg:flex-1'>
          <EligibilityForm form={form} update={update} />
        </section>
        <aside className='lg:sticky lg:top-8 lg:flex-1'>
          <Results result={MOCK_RESULT} />
        </aside>
      </div>
    </main>
  );
};
