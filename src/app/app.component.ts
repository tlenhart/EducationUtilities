import { AsyncPipe, NgClass } from '@angular/common';
import { Component, computed, inject, Signal } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { Route, RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';
import { routes } from './app.routes';
import { ClippyComponent } from './core-ui/clippy/clippy.component';
import { LoaderComponent } from './core-ui/loader/loader.component';
import { MainSidenavComponent } from './core-ui/main-sidenav/main-sidenav.component';
import { MainToolbarComponent } from './core-ui/main-toolbar/main-toolbar.component';
import { AppSidenavService } from './core/app-sidenav-service/app-sidenav.service';
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
    MainToolbarComponent, MainSidenavComponent, ClippyComponent, LoaderComponent, GlobalSettingEnabledPipe, NgClass,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  public title = 'EducationUtilities';
  public routes: Array<AppRoute> = [];
  public readonly isHandset$: Observable<boolean>;
  private readonly deviceTypeService: DeviceTypeService = inject(DeviceTypeService);
  private readonly sidenavService: AppSidenavService = inject(AppSidenavService);
  private readonly settingsService: SettingsService = inject(SettingsService);

  public settings: Signal<Versioned<GlobalSettings>> = computed(() => {
    return this.settingsService.settings();
  });

  public sidenavStyle: Signal<'default' | 'slim'>;

  // Use this to toggle autosizing on the sidenav to try and avoid performance implications mentioned here: https://material.angular.io/components/sidenav/overview#resizing-an-open-sidenav.
  public shouldAutosize: Signal<boolean> = computed(() => this.sidenavService.autosize());

  constructor() {
    // Use the css2 material icons, instead of the defaults.
    // This also corresponds to using a different import in index.html.
    const matIconRegistry: MatIconRegistry = inject(MatIconRegistry);
    matIconRegistry.setDefaultFontSetClass('material-symbols-outlined');

    this.sidenavStyle = this.sidenavService.style;

    // Just look at the root routes to determine primary routing.
    this.routes = [
      ...routes.map((route: Route): AppRoute | null => {
        // ! Something like this may be needed if/when child routes are added.
        // if (!route.path && route.path !== '') {
        //   return null;
        // }
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
      }).filter((value: AppRoute | null) => value !== null),
    ];

    this.isHandset$ = this.deviceTypeService.isHandset$;
  }
}
