import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivateFn, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { FrequencyDataSplitPaneStore } from '../../shared/stores/frequency-data-split-pane.store';

export const showRightPaneResolver: ResolveFn<boolean> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot) => {
  const frequencyStore = inject(FrequencyDataSplitPaneStore);

  frequencyStore.navigateToRightRoute();

  return true;
};

export const hideRightPaneDeactivateFn: CanDeactivateFn<unknown> = () => {
  const frequencyStore = inject(FrequencyDataSplitPaneStore);

  frequencyStore.navigateAwayFromRightRoute();

  return true;
};
