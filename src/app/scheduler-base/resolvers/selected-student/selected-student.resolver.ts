// import { inject } from '@angular/core';
// import { ResolveFn, ActivatedRouteSnapshot, RouterStateSnapshot, RedirectCommand, createUrlTreeFromSnapshot } from '@angular/router';
// import { schedulerDb } from '../../db/scheduler.db';
// import { StudentStore } from '../../stores/student.store';

// export const selectedStudentResolver: ResolveFn<boolean> = async (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | RedirectCommand> => {
//   const aidStore = inject(StudentStore);

//   const aidId = route.paramMap.get('id');

//   if (aidId) {
//     const setSelectedSuccess = await studentStore.setSelectedEntityAsync(aidId, schedulerDb.students);

//     if (!setSelectedSuccess) {
//       if (route.parent) {
//         const newRoute = createUrlTreeFromSnapshot(route.parent, ['./']);
//         return new RedirectCommand(newRoute, {});
//       }
//     }

//     return setSelectedSuccess;
//   }

//   return false;
// }
