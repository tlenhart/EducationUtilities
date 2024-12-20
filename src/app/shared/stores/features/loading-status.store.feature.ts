import { signalStoreFeature, withState } from '@ngrx/signals';

export interface LoadingStatus { isLoading: boolean }

export function withLoadingStatus() {
  return signalStoreFeature(
    withState<LoadingStatus>({ isLoading: false }),
  );
}

export function setLoading(loadingState: boolean): LoadingStatus {
  return { isLoading: loadingState };
}
