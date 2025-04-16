import { inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { NavigationEnd, Route, Router } from '@angular/router';
import { filter } from 'rxjs';
import { routes } from '../../app.routes';
import { AppRoute } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class AppLocationService {

  private readonly _routes: WritableSignal<Array<AppRoute>> = signal([]);
  private readonly _currentRoute: WritableSignal<AppRoute | null> = signal(null);

  public readonly routes: Signal<ReadonlyArray<AppRoute>> = this._routes.asReadonly();
  public readonly currentRoute: Signal<Readonly<AppRoute> | null> = this._currentRoute.asReadonly();

  private readonly router: Router = inject(Router);

  constructor() {
    // Just look at the root routes to determine primary routing.
    this._routes.set([
      ...routes.map((route: Route): AppRoute | null => {
        switch (route.path) {
          case undefined:
          case ('**'):
          case (''): {
            return null;
          }
          default: {
            return {
              path: `/${route.path}`,
              name: `${route.path[0].toLocaleUpperCase()}${route.path.slice(1).replace('-', ' ')}`,
              icon: (route.data?.['icon']) as string | undefined ?? 'error',
            };
          }
        }
      }).filter((value: AppRoute | null) => value !== null)
        .sort((a: AppRoute, b: AppRoute) => {
          // Always place 'Settings' as the last entry before feedback and version.
          if (a.name === 'Settings') {
            return 1;
          }

          if (b.name === 'Settings') {
            return -1;
          }

          return a.name > b.name ? 1 : -1;
        }),
    ]);

    // Update the current route when the base route changes.
    this.router.events
      .pipe(
        filter((routerEvent) => routerEvent instanceof NavigationEnd),
      )
      .subscribe({
        next: (routerEvent: NavigationEnd) => {
          // Only update the current route/feature/utility AppRoute when the base route changes.
          const baseRoute: string = routerEvent.url.split('/').splice(0, 2).join('/').toLowerCase();

          const currentRoute: AppRoute | undefined = this._routes().find(route => route.path === baseRoute);

          this._currentRoute.set(currentRoute ?? null);
        },
      });
  }
}
