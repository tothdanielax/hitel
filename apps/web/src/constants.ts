export const APP_NAME = 'Hitel';
export const APP_DESCRIPTION =
  'Lakáshitel kalkulátor - államilag támogatott és banki hitelek kombinálása';
export const REPO_URL = 'https://github.com/tothdanielax/hitel';
export const THEME_STORAGE_KEY = 'theme';

// Runs before paint so the stored or system theme applies without a flash.
export const THEME_SCRIPT = `try{const t=localStorage.getItem('${THEME_STORAGE_KEY}');document.documentElement.classList.toggle('dark',t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches)}catch{}`;
