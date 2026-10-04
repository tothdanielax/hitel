import { Heading } from '@hitel/ui/components/typography';
import { APP_NAME } from '@/constants';

export const Calculator = () => {
  return (
    <main className='mx-auto max-w-5xl p-6'>
      <Heading>{APP_NAME}</Heading>
    </main>
  );
};
