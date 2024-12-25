import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, createUrlTreeFromSnapshot, RedirectCommand, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { TeacherStore } from '../../stores/teacher.store';
import { schedulerDb } from '../../db/scheduler.db';

export const selectedTeacherResolver: ResolveFn<boolean> = async (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | RedirectCommand> => {
  const teacherStore = inject(TeacherStore);

  const teacherId = route.paramMap.get('id');

  if (teacherId) {
    const setSelectedSuccess = await teacherStore.setSelectedEntityAsync(teacherId, schedulerDb.teachers);

    if (!setSelectedSuccess) {
      if (route.parent) {
        const newRoute = createUrlTreeFromSnapshot(route.parent, ['./']);
        return new RedirectCommand(newRoute, {});
      }
    }

    return setSelectedSuccess
  }

  return false;
}
