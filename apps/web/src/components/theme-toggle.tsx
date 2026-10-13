import { IconButton } from '@hitel/ui/components/button';
import { MoonIcon, SunIcon } from 'lucide-react';
import { THEME_STORAGE_KEY } from '@/constants';

const LABEL = 'Világos / sötét mód';

export const ThemeToggle = () => {
  return (
    <IconButton
      aria-label={LABEL}
      tooltip={LABEL}
      onClick={toggleTheme}
      icon={
        <>
          <SunIcon className='hidden dark:block' />
          <MoonIcon className='dark:hidden' />
        </>
      }
    />
  );
};

const toggleTheme = () => {
  const isDark = document.documentElement.classList.toggle('dark');
  try {
    localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
  } catch {}
};
