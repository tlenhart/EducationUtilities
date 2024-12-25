import { ChangeDetectionStrategy, Component, inject, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GlobalUIService } from '../../core/app-sidenav-service/global-ui.service';
import { ScheduleStore } from '../stores/schedule.store';

@Component({
  selector: 'eu-schedule-dashboard',
  imports: [
    RouterLink,
  ],
  templateUrl: './schedule-dashboard.component.html',
  styleUrl: './schedule-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleDashboardComponent implements OnDestroy {
  private readonly globalUIService: GlobalUIService = inject(GlobalUIService);
  public readonly scheduleStore = inject(ScheduleStore);

  constructor() {
    this.globalUIService.setGlobalUI({ showAppTitleBar: false, sidenavStyle: 'slim' });
    this.scheduleStore.loadSchedules();
  }

  public ngOnDestroy(): void {
    this.globalUIService.setGlobalUI({ showAppTitleBar: true, sidenavStyle: 'default' });
  }

  public async addSchedule(): Promise<void> {
    await this.scheduleStore.addSchedule({
      title: 'Schedule 2',
    });
  }
}
