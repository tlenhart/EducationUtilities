import { signalStoreFeature, withState } from '@ngrx/signals';

export interface ValuesLoadedFromDb {
  hasLoaded: boolean;
}

export function withHasLoadedFromDb() {
  return signalStoreFeature(
    withState<ValuesLoadedFromDb>({ hasLoaded: false }),
  );
}

export function setLoadedFromDb(loaded: boolean): ValuesLoadedFromDb {
  return { hasLoaded: loaded };
}
