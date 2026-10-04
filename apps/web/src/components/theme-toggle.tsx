import { Button } from '@hitel/ui/components/button';
import { MoonIcon, SunIcon } from 'lucide-react';
import { THEME_STORAGE_KEY } from '@/constants';

export const ThemeToggle = () => {
  const toggle = () => {
    const dark = document.documentElement.classList.toggle('dark');
    try {
      localStorage.setItem(THEME_STORAGE_KEY, dark ? 'dark' : 'light');
    } catch {}
  };

  return (
    <Button variant='outline' size='icon' aria-label='Világos / sötét mód' onClick={toggle}>
      <SunIcon className='hidden dark:block' />
      <MoonIcon className='dark:hidden' />
    </Button>
  );
};
