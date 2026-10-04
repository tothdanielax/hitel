import { Heading } from '@hitel/ui/components/heading';
import { Paragraph } from '@hitel/ui/components/paragraph';
import { RULES_AS_OF } from '@hitel/core/constants';
import { APP_DESCRIPTION, APP_NAME } from '@/constants';
import { formatDate } from '@hitel/core/utils/date';
import { EligibilityForm } from './components/eligibility-form';
import { Results } from './components/results';
import { useCalculatorForm } from './hooks/use-calculator-form';
import { ThemeToggle } from '@/components/theme-toggle';
import { ShareButton } from './components/share-button';

export const Calculator = () => {
  const { form, plan } = useCalculatorForm();

  return (
    <main className='mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10'>
      <header className='flex items-start justify-between gap-4'>
        <div className='flex flex-col gap-1'>
          <Heading as='h1'>{APP_NAME}</Heading>
          <Paragraph muted>{APP_DESCRIPTION}</Paragraph>
        </div>
        <div className='flex shrink-0 gap-2'>
          <ShareButton />
          <ThemeToggle />
        </div>
      </header>
      <div className='flex flex-col gap-6 lg:flex-row lg:items-start'>
        <section aria-label='Adatok' className='min-w-0 lg:flex-1'>
          <EligibilityForm form={form} />
        </section>
        <aside
          aria-label='Eredmény'
          className='min-w-0 lg:sticky lg:top-6 lg:max-h-[calc(100dvh-3rem)] lg:flex-1 lg:overflow-y-auto'
        >
          <Results plan={plan} />
        </aside>
      </div>
      <footer>
        <Paragraph size='sm' muted>
          Szabályok állapota: {formatDate(RULES_AS_OF)} A számítás tájékoztató jellegű, nem minősül
          ajánlatnak. A banki kamatok kézzel frissített alapértékek, a Banki ajánlatok blokkban
          átírhatók.
        </Paragraph>
      </footer>
    </main>
  );
};
