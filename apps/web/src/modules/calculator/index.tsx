import { Heading, Paragraph } from '@hitel/ui/components/typography';
import { RULES_AS_OF } from '@hitel/core/constants';
import { APP_DESCRIPTION, APP_NAME } from '@/constants';
import { formatMonth } from '@/utils/date';
import { EligibilityForm } from './components/eligibility-form';
import { Results } from './components/results';
import { useCalculatorForm } from './hooks/use-calculator-form';

export const Calculator = () => {
  const { form, plan } = useCalculatorForm();

  return (
    <main className='mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10'>
      <header className='flex flex-col gap-1'>
        <Heading as='h1'>{APP_NAME}</Heading>
        <Paragraph muted>{APP_DESCRIPTION}</Paragraph>
      </header>
      <div className='flex flex-col gap-6 lg:flex-row lg:items-start'>
        <section aria-label='Adatok' className='min-w-0 lg:flex-1'>
          <EligibilityForm form={form} />
        </section>
        <aside aria-label='Eredmény' className='min-w-0 lg:sticky lg:top-6 lg:flex-1'>
          <Results plan={plan} />
        </aside>
      </div>
      <footer>
        <Paragraph size='sm' muted>
          Szabályok állapota: {formatMonth(RULES_AS_OF.slice(0, 7))}. A számítás tájékoztató
          jellegű, nem minősül ajánlatnak. A banki kamatok kézzel frissített adatok.
        </Paragraph>
      </footer>
    </main>
  );
};
