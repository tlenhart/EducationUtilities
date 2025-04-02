import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ScheduleStore } from '../../stores/schedule.store';
import { ScheduleCalendarComponent } from './schedule-calendar/schedule-calendar.component';

@Component({
  selector: 'eu-schedule-builder',
  imports: [
    ScheduleCalendarComponent,
  ],
  templateUrl: './schedule-builder.component.html',
  styleUrl: './schedule-builder.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleBuilderComponent {
  public readonly scheduleId = computed(() => this.scheduleStore.selectedEntityId());
  private readonly scheduleStore = inject(ScheduleStore);
}
