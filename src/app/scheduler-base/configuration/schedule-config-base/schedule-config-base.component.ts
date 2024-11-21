import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatTabLink, MatTabNav, MatTabNavPanel } from '@angular/material/tabs';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AppRoute } from '../../../models';
import { scheduleConfigurationAppRoutes } from '../scheduler-configuration.routes';

@Component({
  selector: 'eu-schedule-config-base',
  standalone: true,
  imports: [
    MatTabNav,
    MatTabLink,
    MatTabNavPanel,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './schedule-config-base.component.html',
  styleUrl: './schedule-config-base.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleConfigBaseComponent {
  public readonly configurationRoutes: Array<AppRoute> = [];

  constructor() {
    this.configurationRoutes = scheduleConfigurationAppRoutes(false);
  }
}
