import { BasicTimeInput, TimeInterval } from '../models/time.model';
import { TemporalDayOfWeek } from '../scheduler-base/models/schedule-time.model';

export interface NewGlobalSettings {
  // id: number; // May not be needed.
  name: 'user' | 'default';
  schedulerSettings: SchedulerSettings;
  feedbackSettings: FeedbackSettings;
  displaySettings: DisplaySettings;
  frequencyDataSettings: FrequencyDataSettings;
}

export interface Setting_New<T> {
  value: T;
}

export interface ScheduleTimeSettings {
  timePickerInterval: TimeInterval;
  dayStart: BasicTimeInput;
  dayEnd: BasicTimeInput;
}

export interface ScheduleDateSettings {
  weekStart: TemporalDayOfWeek;
  excludeDays: Array<TemporalDayOfWeek>;
}

// TODO: This may need to replace ScheduleTimeSettings.
export interface ScheduleCalendarSettings {
  dayStart: BasicTimeInput;
  dayEnd: BasicTimeInput;
  defaultCalendarTimeInterval: TimeInterval;
}

export interface SchedulerSettings {
  time: ScheduleTimeSettings;
  date: ScheduleDateSettings;
  calendar: ScheduleCalendarSettings;
  panelSplitPercentage: number;
}

export interface FeedbackSettings {
  secret: string;
  showSecret: boolean;
  enabled: boolean;
}

export interface DisplaySettings {
  /**
   * Use settingsStore.dateTimeFormatter.format() instead of using this directly.
   *   (Except when setting the settings in the first place.)
   */
  dateTimeFormat: Intl.DateTimeFormatOptions;
  useDetailedDateTimeFormatting: boolean;
  dateOnlyFormat: OptionalDateTimeDisplaySettings;
  timeOnlyFormat: OptionalDateTimeDisplaySettings;
}

export interface DateTimeDisplaySettings {
  format: Intl.DateTimeFormatOptions;
  useDetailedFormatting: boolean;
}

export type OptionalDateTimeDisplaySettings = DateTimeDisplaySettings & {
  enabled: boolean;
};

export interface FrequencyDataSettings {
  enableHapticFeedback: boolean;
}
