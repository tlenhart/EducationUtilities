import { ActivatedRouteSnapshot, createUrlTreeFromSnapshot, RedirectCommand } from '@angular/router';

export function preventRouteOnFailure(route: ActivatedRouteSnapshot): RedirectCommand | false {
  if (route.parent) {
    // TODO: Make sure this works correctly with a studentId param as a "parent" route.
    const newRoute = createUrlTreeFromSnapshot(route.parent, ['./']);
    return new RedirectCommand(newRoute, { });
  }

  return false;
}
