import { AsyncPipe } from '@angular/common';
import { Component, computed, inject, Signal } from '@angular/core';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { Route, RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';
import { routes } from './app.routes';
import { ClippyComponent } from './core-ui/clippy/clippy.component';
import { LoaderComponent } from './core-ui/loader/loader.component';
import { MainSidenavComponent } from './core-ui/main-sidenav/main-sidenav.component';
import { MainToolbarComponent } from './core-ui/main-toolbar/main-toolbar.component';
import { DeviceTypeService } from './core/device-type/device-type.service';
import { GlobalSettingEnabledPipe } from './core/settings/setting-enabled/global-setting-enabled.pipe';
import { SettingsService } from './core/settings/settings.service';
import { AppRoute, GlobalSettings, Versioned } from './models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    AsyncPipe,
    RouterOutlet,
    MatSidenav, MatSidenavContainer, MatSidenavContent,
    MainToolbarComponent, MainSidenavComponent, ClippyComponent, LoaderComponent, GlobalSettingEnabledPipe,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  public title = 'EducationUtilities';
  public routes: Array<AppRoute> = [];
  public readonly isHandset$: Observable<boolean>;
  private readonly deviceTypeService: DeviceTypeService = inject(DeviceTypeService);
  private readonly settingsService: SettingsService = inject(SettingsService);

  public settings: Signal<Versioned<GlobalSettings>> = computed(() => {
    return this.settingsService.settings();
  });

  constructor() {
    // Just look at the root routes to determine primary routing.
    this.routes = [
      ...routes.map((route: Route): AppRoute | null => {
        // ! Something like this may be needed if/when child routes are added.
        // if (!route.path && route.path !== '') {
        //   return null;
        // }
        switch (route.path) {
          case undefined:
          case null:
          case ('**'):
          case (''): {
            return null;
          }
          default: {
            return {
              path: `/${route.path}`,
              name: `${route.path[0].toLocaleUpperCase()}${route.path?.slice(1).replace('-', ' ')}`,
            };
          }
        }
      }).filter((value: AppRoute | null) => value !== null),
    ];

    this.isHandset$ = this.deviceTypeService.isHandset$;
  }
}
