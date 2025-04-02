import { ChangeDetectionStrategy, Component, computed, inject, input, InputSignal, Signal } from '@angular/core';
import { MatDivider } from '@angular/material/divider';
import { SettingsStore } from '../../../../settings/settings.store';
import { Temporal } from 'temporal-polyfill';
import { DayOfWeekEnumPipe } from '../../../../shared/pipes/day-of-week-enum/day-of-week-enum.pipe';
import { PlainTimePipe } from '../../../../shared/pipes/plain-time/plain-time.pipe';
import { TemporalDayOfWeek } from '../../../models/schedule-time.model';

@Component({
  selector: 'eu-schedule-calendar-day',
  imports: [
    PlainTimePipe,
    MatDivider,
    DayOfWeekEnumPipe,
  ],
  templateUrl: './schedule-calendar-day.component.html',
  styleUrl: './schedule-calendar-day.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleCalendarDayComponent {
  /* Inputs */
  public readonly dayOfWeek: InputSignal<TemporalDayOfWeek> = input.required();

  /* Computed Signals */
  // TODO: Might make more sense to pass this in so it doesn't have to be duplicated for each component. (Especially when days change.)
  public readonly defaultTimeIntervals: Signal<ReadonlyArray<Temporal.PlainTime>> = computed(() => this.settingsStore.calendarDayIntervals());

  /* DI Services */
  private readonly settingsStore = inject(SettingsStore);
}
