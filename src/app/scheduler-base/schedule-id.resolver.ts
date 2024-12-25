import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { AidStore } from './stores/aid.store';
import { ScheduleStore } from './stores/schedule.store';

export const scheduleIdResolver: ResolveFn<boolean> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const scheduleStore = inject(ScheduleStore);
  const aidStore = inject(AidStore);
  // const studentStore = inject(StudentStore);

  // TODO: Figure out how to prevent routing to the new thing and fall back to the dashboard.
  // TODO: Needs setSelectedEntity to be able to check the database first though.
  const scheduleId: number = parseInt(route.paramMap.get('id') ?? '');

  if (isNaN(scheduleId)) {
    return false;
  }

  const setScheduleSuccess = scheduleStore.setSelectedEntity(scheduleId);

  // TODO: Load teachers and others here?

  if (setScheduleSuccess) {
    console.log('updating teachers.', setScheduleSuccess);

  }

  return setScheduleSuccess;
};
