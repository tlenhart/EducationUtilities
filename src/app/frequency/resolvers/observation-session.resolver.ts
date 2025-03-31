import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { GlobalRouteParams } from '../../models/global-route-params.model';
import { CurrentObservationSessionStore } from '../../shared/stores/current-observation-session.store';
import { StudentStore } from '../../shared/stores/student.store';
import { preventRouteOnFailure } from '../../utils/route.utils';

export const observationSessionResolver: ResolveFn<boolean> = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot) => {

  const currentObservationSessionStore = inject(CurrentObservationSessionStore);
  const studentStore = inject(StudentStore);

  // TODO: Figure out how to prevent routing to the new thing and fall back to the dashboard.
  const observationSessionId: number = parseInt(route.paramMap.get(GlobalRouteParams.observationSessionId) ?? '');

  if (isNaN(observationSessionId)) {
    return false;
  }

  const sessionLoaded = await currentObservationSessionStore.openObservationSession(observationSessionId);
  let setStudentSuccess: boolean = false;

  // TODO: May not be necessary since it's set by openObservationSession().
  if (sessionLoaded) {
    setStudentSuccess = studentStore.setPrimaryEntity(currentObservationSessionStore.currentObservation.personId());
  }

  const success = sessionLoaded && setStudentSuccess;

  if (!success) {
    return preventRouteOnFailure(route.parent ?? route); // TODO: Update to go to the right route. (Dashboard probably, or just prevent routing altogether.)
  }

  return success;
};
