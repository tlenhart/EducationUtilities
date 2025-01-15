import { BasicTimeInput, TimeInterval } from '../models/time.model';
import { TemporalDayOfWeek } from '../scheduler-base/models/schedule-time.model';

export interface NewGlobalSettings {
  // id: number; // May not be needed.
  name: 'user' | 'default';
  schedulerSettings: SchedulerSettings;
  feedbackSettings: FeedbackSettings;
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
