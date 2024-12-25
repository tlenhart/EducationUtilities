import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot, RouterStateSnapshot, RedirectCommand, createUrlTreeFromSnapshot } from '@angular/router';
import { schedulerDb } from '../../db/scheduler.db';
import { AidStore } from '../../stores/aid.store';

export const selectedAidResolver: ResolveFn<boolean> = async (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | RedirectCommand> => {
  const aidStore = inject(AidStore);

  const aidId = route.paramMap.get('id');

  if (aidId) {
    const setSelectedSuccess = await aidStore.setSelectedEntityAsync(aidId, schedulerDb.aids);

    if (!setSelectedSuccess) {
      if (route.parent) {
        const newRoute = createUrlTreeFromSnapshot(route.parent, ['./']);
        return new RedirectCommand(newRoute, {});
      }
    }

    return setSelectedSuccess;
  }

  return false;
}
