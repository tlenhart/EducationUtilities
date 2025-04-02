import { Pipe, PipeTransform } from '@angular/core';
import { RouterLinkElementType, RouterLinkType } from '../../../models/route-link.types';

@Pipe({
  name: 'routerLinkBuilder',
  pure: true,
})
export class RouterLinkBuilderPipe implements PipeTransform {

  public transform(finalRoute: RouterLinkType, baseRoute?: ReadonlyArray<string> | Array<string>): Array<RouterLinkElementType> {
    const constructedRoute: RouterLinkType = [];

    if (baseRoute) {
      constructedRoute.unshift(...baseRoute);
    }

    if (Array.isArray(finalRoute)) {
      constructedRoute.push(...finalRoute);
    } else {
      constructedRoute.push(finalRoute);
    }

    return constructedRoute;
  }

}
