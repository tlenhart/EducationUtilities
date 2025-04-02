import { AsyncPipe, NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';
import { ClippyComponent } from './core-ui/clippy/clippy.component';
import { LoaderComponent } from './core-ui/loader/loader.component';
import { MainSidenavComponent } from './core-ui/main-sidenav/main-sidenav.component';
import { MainToolbarComponent } from './core-ui/main-toolbar/main-toolbar.component';
import { AppLocationService } from './core/app-location/app-location.service';
import { GlobalUIService } from './core/app-sidenav-service/global-ui.service';
import { DeviceTypeService } from './core/device-type/device-type.service';
import { GlobalSettingEnabledPipe } from './core/settings/setting-enabled/global-setting-enabled.pipe';
import { SettingsService } from './core/settings/settings.service';
import { AppRoute, GlobalSettings, Versioned } from './models';
import { SettingsStore } from './settings/settings.store';

@Component({
  selector: 'app-root',
  imports: [
    AsyncPipe,
    RouterOutlet,
    MatSidenav, MatSidenavContainer, MatSidenavContent,
    MainToolbarComponent, MainSidenavComponent, ClippyComponent, LoaderComponent, GlobalSettingEnabledPipe, NgClass,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  public title = 'EducationUtilities';
  public hideClippyManually: WritableSignal<boolean> = signal(false);
  public readonly routes: Signal<ReadonlyArray<AppRoute>>;
  public readonly isHandset$: Observable<boolean>;
  private readonly appLocationService: AppLocationService = inject(AppLocationService);
  private readonly deviceTypeService: DeviceTypeService = inject(DeviceTypeService);
  private readonly globalUIService: GlobalUIService = inject(GlobalUIService);
  private readonly settingsService: SettingsService = inject(SettingsService);
  private readonly settingsStore = inject(SettingsStore);

  public settings: Signal<Versioned<GlobalSettings>> = computed(() => {
    return this.settingsService.settings();
  });

  public sidenavStyle: Signal<'default' | 'slim'>;

  // Use this to toggle autosizing on the sidenav to try and avoid performance implications mentioned here: https://material.angular.io/components/sidenav/overview#resizing-an-open-sidenav.
  public shouldAutosize: Signal<boolean> = computed(() => this.globalUIService.autosize());

  public showAppTitleBar: Signal<boolean> = computed(() => this.globalUIService.showAppTitleBar());

  constructor() {
    // Use the css2 material icons, instead of the defaults.
    // This also corresponds to using a different import in index.html.
    const matIconRegistry: MatIconRegistry = inject(MatIconRegistry);
    matIconRegistry.setDefaultFontSetClass('material-symbols-outlined');

    this.sidenavStyle = this.globalUIService.style;

    this.routes = this.appLocationService.routes;

    this.isHandset$ = this.deviceTypeService.isHandset$;
  }

  public ngOnInit(): void {
    this.settingsStore.loadSettings();
  }

  public removeClippy(): void {
    this.hideClippyManually.set(true);
  }
}
