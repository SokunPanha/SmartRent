import { useSyncExternalStore } from 'react';

const noop = () => () => {};

/** False during server render / hydration, true afterwards — without the
 *  extra render of a `useEffect(() => setMounted(true))`. */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false
  );
}
