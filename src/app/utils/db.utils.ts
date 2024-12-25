import { Temporal } from 'temporal-polyfill';
import { DbEntryWithTemporalType, ScheduleTime } from '../scheduler-base/models/schedule-time.model';
import { Table } from 'dexie';

export function mapToDbAvailability(availabilityEntries: Array<ScheduleTime> | undefined): Array<DbEntryWithTemporalType<ScheduleTime>> {
  return availabilityEntries?.map((availability: ScheduleTime): DbEntryWithTemporalType<ScheduleTime> => {
    return {
      ...availability,
      startTime: availability.startTime.toString(),
      endTime: availability.endTime.toString(),
      days: [...availability.days], // ?
    } as DbEntryWithTemporalType<ScheduleTime>;
  }) ?? [];
}

export function mapFromDbAvailability(availabilityEntries: Array<DbEntryWithTemporalType<ScheduleTime>> | undefined): Array<ScheduleTime> {
  return availabilityEntries?.map((availability: DbEntryWithTemporalType<ScheduleTime>) => {
    return {
      ...availability,
      startTime: Temporal.PlainTime.from(availability.startTime),
      endTime: Temporal.PlainTime.from(availability.endTime),
      days: [...availability.days], // ?
    } as ScheduleTime;
  }) ?? [];
}

export function filterTables(tables: Array<Table>, pickTableNames?: Array<string> | 'full'): Array<Table> {
  // If no table names were provided, return all tables.
  if (!pickTableNames || pickTableNames === 'full' || pickTableNames.length === 0) {
    return tables;
  }

  return tables.filter((table: Table) => pickTableNames.includes(table.name) ?? false); // TODO? Decide what to return when no valid table names were matched.
}
