import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuContent, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatToolbar } from '@angular/material/toolbar';
import { RouterLink, RouterOutlet } from '@angular/router';
import { GlobalUIService } from '../core/app-sidenav-service/global-ui.service';
import { AppRoute } from '../models';
import { SettingsStore } from '../settings/settings.store';
import { ResizerDirective } from '../shared/resizer/resizer.directive';
import { PanelState } from '../shared/resizer/resizer.models';
import { scheduleConfigurationAppRoutes } from './configuration/scheduler-configuration.routes';
import { ScheduleStore } from './stores/schedule.store';

@Component({
  selector: 'eu-scheduler-base',
  imports: [
    MatIcon,
    ResizerDirective,
    RouterOutlet,
    RouterLink,
    MatToolbar,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    MatButton,
    MatIconButton,
    MatMenuContent,
  ],
  templateUrl: './scheduler-base.component.html',
  styleUrl: './scheduler-base.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchedulerBaseComponent implements OnDestroy {
  private readonly globalUIService: GlobalUIService = inject(GlobalUIService);
  private readonly scheduleStore = inject(ScheduleStore);
  private readonly settingsStore = inject(SettingsStore);

  public panelOneState: PanelState = 'open';
  public panelTwoState: PanelState = 'open';

  public readonly configurationRoutes: Array<AppRoute> = scheduleConfigurationAppRoutes(false);

  // TODO: If you get infinite loops here... Change from Signal, to just number.
  public readonly splitPercent = this.settingsStore.schedulerSettings.panelSplitPercentage;

  public readonly currentSchedule = computed(() => this.scheduleStore.selectedEntityId());

  constructor() {
    this.globalUIService.setGlobalUI({ showAppTitleBar: false, sidenavStyle: 'slim' });
  }

  public ngOnDestroy(): void {
    this.globalUIService.setGlobalUI({ showAppTitleBar: true, sidenavStyle: 'default' });
  }

  public splitChange(splitPercentage: number): void {
    this.settingsStore.updateSchedulerPanelSplitPercent(splitPercentage);
  }

  public async export(): Promise<void> {
    await this.settingsStore.exportSettings();
  }
}
