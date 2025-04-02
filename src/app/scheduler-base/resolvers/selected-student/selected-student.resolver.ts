import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  createUrlTreeFromSnapshot,
  MaybeAsync,
  RedirectCommand,
  ResolveFn,
  RouterStateSnapshot,
} from '@angular/router';
import { map, skipWhile } from 'rxjs';
import { GlobalRouteParams } from '../../../models/global-route-params.model';
import { StudentStore } from '../../../shared/stores/student.store';
import { PersonId } from '../../models/person-type.model';

export const selectedStudentResolver: ResolveFn<boolean> =
  (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): MaybeAsync<boolean | RedirectCommand> => {

    const studentStore = inject(StudentStore);

    let studentId: string | PersonId | null = route.paramMap.get('studentId');

    if (typeof studentId === 'string') {
      studentId = parseInt(studentId, 10);
    }

    // TODO: Deal with non-existent ids.
    let setSelectedSuccess: boolean = false;

    // TODO: Consider moving this farther up the routing where the student store (and other stores) are loaded much earlier.
    //  Could be in a resolver even.
    if (studentId && !isNaN(studentId)) {
      return studentStore.isLoaded$.pipe(
        skipWhile(value => value === null),
        map((loadedValue) => {
          setSelectedSuccess = studentStore.setConfigurationEntity(studentId);

          if (!setSelectedSuccess) {
            if (route.parent) {
              const newRoute = createUrlTreeFromSnapshot(route.parent, ['./']);
              return new RedirectCommand(newRoute, {});
            }
          }

          return setSelectedSuccess;
        }),
      );

    } else {
      if (route.parent) {
        const newRoute = createUrlTreeFromSnapshot(route.parent, ['./']);
        return new RedirectCommand(newRoute, {});
      }
    }

    return false;

  // if (!setSelectedSuccess) {
  //   if (route.parent) {
  //     const newRoute = createUrlTreeFromSnapshot(route.parent, ['./']);
  //     return new RedirectCommand(newRoute, {});
  //   }
  // }
  //
  // return setSelectedSuccess;
};

export const primarySelectedStudentResolver: ResolveFn<boolean> =
  (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): MaybeAsync<boolean | RedirectCommand> => {

    const studentStore = inject(StudentStore);

    let studentId: string | PersonId | null = route.paramMap.get(GlobalRouteParams.primaryStudentId);

    if (typeof studentId === 'string') {
      studentId = parseInt(studentId, 10);
    }

    // TODO: Deal with non-existent ids.
    let setSelectedSuccess: boolean = false;

    // TODO: Consider moving this farther up the routing where the student store (and other stores) are loaded much earlier.
    //  Could be in a resolver even.
    if (studentId && !isNaN(studentId)) {
      return studentStore.isLoaded$.pipe(
        skipWhile(value => value === null),
        map((loadedValue) => {

          setSelectedSuccess = studentStore.setPrimaryEntity(studentId);

          if (!setSelectedSuccess) {
            if (route.parent) {
              const newRoute = createUrlTreeFromSnapshot(route.parent, ['./']);
              return new RedirectCommand(newRoute, {});
            }
          }

          return setSelectedSuccess;
        }),
      );

    } else {
      if (route.parent) {
        const newRoute = createUrlTreeFromSnapshot(route.parent, ['./']);
        return new RedirectCommand(newRoute, {});
      }
    }

    return false;
  };
