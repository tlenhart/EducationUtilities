import { Temporal } from 'temporal-polyfill';

// Day of week starts with Monday as day 1 and ends with Sunday as day 7.
// User overrides in SettingsStore can be used to control the visible ordering of dates.
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

// export function getDaysOfWeek(exclude: Array<TemporalDayOfWeek> = []): ReadonlyArray<TemporalDayOfWeek> {
export function getDaysOfWeek(exclude: Array<TemporalDayOfWeek> = [], startsOn: TemporalDayOfWeek = TemporalDayOfWeek.Monday): ReadonlyArray<TemporalDayOfWeek> {
  const defaultWeek: Array<TemporalDayOfWeek> = [
    TemporalDayOfWeek.Monday,
    TemporalDayOfWeek.Tuesday,
    TemporalDayOfWeek.Wednesday,
    TemporalDayOfWeek.Thursday,
    TemporalDayOfWeek.Friday,
    TemporalDayOfWeek.Saturday,
    TemporalDayOfWeek.Sunday,
  ];

  // Find the index of the first day of the week and shift the array to put it at the front.
  const index = defaultWeek.indexOf(startsOn);

  if (index >= 1) {
    defaultWeek.push(...defaultWeek.splice(0, index));
  }

  // Turn into a set to be able to easily remove specific values without having to iterate of the list multiple times to find specific values.
  const defaultWeekSet = new Set<TemporalDayOfWeek>(defaultWeek);

  for (const remove of exclude) {
    defaultWeekSet.delete(remove);
  }

  return Array.from(defaultWeekSet);
}

export const TemporalDayOfWeekToDayOfWeekMap_Map = new Map<TemporalDayOfWeek, DayOfWeek>([
  [TemporalDayOfWeek.Monday, 'Monday'],
  [TemporalDayOfWeek.Tuesday, 'Tuesday'],
  [TemporalDayOfWeek.Wednesday, 'Wednesday'],
  [TemporalDayOfWeek.Thursday, 'Thursday'],
  [TemporalDayOfWeek.Friday, 'Friday'],
  [TemporalDayOfWeek.Saturday, 'Saturday'],
  [TemporalDayOfWeek.Sunday, 'Sunday'],
]);

export const TemporalDayOfWeekToDayOfWeekMap: Readonly<Record<TemporalDayOfWeek, DayOfWeek>> = {
  [TemporalDayOfWeek.Monday]:  'Monday',
  [TemporalDayOfWeek.Tuesday]:  'Tuesday',
  [TemporalDayOfWeek.Wednesday]:  'Wednesday',
  [TemporalDayOfWeek.Thursday]:  'Thursday',
  [TemporalDayOfWeek.Friday]:  'Friday',
  [TemporalDayOfWeek.Saturday]:  'Saturday',
  [TemporalDayOfWeek.Sunday]:  'Sunday',
};

// TODO: Would this make more sense as a pipe?
export const TemporalDayOfWeekToShortDayOfWeek: Record<TemporalDayOfWeek, DayOfWeekShort> = {
  [TemporalDayOfWeek.Monday]:  'M',
  [TemporalDayOfWeek.Tuesday]:  'Tu',
  [TemporalDayOfWeek.Wednesday]:  'W',
  [TemporalDayOfWeek.Thursday]:  'Th',
  [TemporalDayOfWeek.Friday]:  'F',
  [TemporalDayOfWeek.Saturday]:  'Sa',
  [TemporalDayOfWeek.Sunday]:  'Su',
};

export interface ScheduleTime {
  startTime: Temporal.PlainTime;
  endTime: Temporal.PlainTime;
  days: Array<TemporalDayOfWeek>;
}

export type DbEntryWithTemporalType<T> = {
  [K in keyof T]: T[K] extends Temporal.PlainTime ? string : T[K];
};

export type DbEntryWithZonedTemporalType<T> = {
  [K in keyof T]: T[K] extends Temporal.ZonedDateTime ? string : T[K];
};

export function availabilityIsScheduleTimeArray(schedule: Array<ScheduleTime> | Array<DbEntryWithTemporalType<ScheduleTime>> | undefined): schedule is Array<ScheduleTime> {
  if (Array.isArray(schedule) && schedule.length > 0) {
    if (typeof schedule[0] === 'string') {
      return false;
    } else {
      return true;
    }
  } else {
    return false;
  }
}
