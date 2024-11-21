import { Temporal } from 'temporal-polyfill';

// Day of week starts with Monday as day 1 and ends with Sunday as day 7.
// See: https://en.wikipedia.org/wiki/ISO_8601#Week_dates.

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
export type DayOfWeekShort = 'M' | 'Tu' | 'W' | 'Th' | 'F' | 'Sa' | 'Su';
export enum TemporalDayOfWeek {
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
  Sunday = 7,
}

export interface ScheduleTime {
  startTime: Temporal.PlainTime;
  endTime: Temporal.PlainTime;
  days: Array<TemporalDayOfWeek>; // TODO: Determine if an enum is how you want to store this.
}
