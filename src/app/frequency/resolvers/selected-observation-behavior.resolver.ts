import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  createUrlTreeFromSnapshot,
  RedirectCommand,
  ResolveFn,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { eduUtilsDb } from '../../core/db/edu-utils.db';
import { ObservationBehaviorStore } from '../../shared/stores/observation-behavior.store';
import {
  observationBehaviorRouteParamKeys,
} from '../frequency-configuration/all-observation-behaviors-configuration/observation-behavior-configuration.routes';

export const selectedObservationBehaviorResolver: ResolveFn<boolean> = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot): Promise<boolean | RedirectCommand> => {
  const observationBehaviorStore = inject(ObservationBehaviorStore);

  const observationBehaviorId = route.paramMap.get(observationBehaviorRouteParamKeys.observationBehaviorId);

  if (observationBehaviorId) {
    const setSelectedSuccess = await observationBehaviorStore.setSelectedEntityAsync(observationBehaviorId, eduUtilsDb.observationBehaviors);

    if (!setSelectedSuccess) {
      if (route.parent) {
        const newRoute: UrlTree = createUrlTreeFromSnapshot(route.parent, ['./']);
        return new RedirectCommand(newRoute, {});
      }
    }

    return setSelectedSuccess;
  }

  return false;
};
