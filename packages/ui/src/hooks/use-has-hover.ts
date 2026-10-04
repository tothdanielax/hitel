import { useSyncExternalStore } from 'react';

let hoverQuery: MediaQueryList | undefined;
const getHoverQuery = () => (hoverQuery ??= window.matchMedia('(hover: hover)'));

const subscribe = (onChange: () => void) => {
  const query = getHoverQuery();
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
};

// Server render assumes hover, the client corrects it after hydration.
export const useHasHover = (): boolean => {
  return useSyncExternalStore(
    subscribe,
    () => getHoverQuery().matches,
    () => true
  );
};
