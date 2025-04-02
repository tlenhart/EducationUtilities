import { toObservable } from '@angular/core/rxjs-interop';
import { signalStoreFeature, withProps, withState } from '@ngrx/signals';

export interface LoadingStatus { isLoading: boolean, isLoaded: boolean | null }

export function withLoadingStatus() {
  return signalStoreFeature(
    withState<LoadingStatus>({ isLoading: false, isLoaded: null }),
    withProps(({ isLoading, isLoaded }) => ({
      isLoading$: toObservable(isLoading),
      isLoaded$: toObservable(isLoaded),
    })),
  );
}

export function setLoading(loadingState: boolean): Partial<LoadingStatus> {
  return { isLoading: loadingState };
}

export function setLoaded(loaded: boolean): Partial<LoadingStatus> {
  return { isLoaded: loaded };
}

export function resetLoaded(): Partial<LoadingStatus> {
  return { isLoaded: null };
}
