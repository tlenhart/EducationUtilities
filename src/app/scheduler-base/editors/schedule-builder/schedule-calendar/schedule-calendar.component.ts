import { ChangeDetectionStrategy, Component, computed, inject, input, Signal } from '@angular/core';
import { EntityId } from '@ngrx/signals/entities';
import { SettingsStore } from '../../../../settings/settings.store';
import { TemporalDayOfWeek } from '../../../models/schedule-time.model';
import { ScheduleCalendarDayComponent } from '../schedule-calendar-day/schedule-calendar-day.component';

@Component({
  selector: 'eu-schedule-calendar',
  imports: [
    ScheduleCalendarDayComponent,
  ],
  templateUrl: './schedule-calendar.component.html',
  styleUrl: './schedule-calendar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleCalendarComponent {
  public readonly scheduleId = input.required<EntityId | null>();
  public readonly days: Signal<ReadonlyArray<TemporalDayOfWeek>> = computed(() => this.settingsStore.calendarDays());

  private readonly settingsStore = inject(SettingsStore);

  constructor() {

  }
}
