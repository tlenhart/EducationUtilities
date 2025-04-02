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

export function filterTables(tables: Array<Table>, pickTableNames?: Array<string> | 'full', format: 'include' | 'exclude' = 'include'): Array<Table> {
  // If no table names were provided, return all tables.
  if (!pickTableNames || pickTableNames === 'full' || pickTableNames.length === 0) {
    if (format === 'exclude') {
      return []; // TODO: Might not be correct.
    }
    return tables;
  }

  // TODO: This may not work correctly.
  return tables.filter((table: Table) => {
    if (pickTableNames.includes(table.name)) {
      return format === 'include' ? true : false;
    }

    return format === 'exclude';
    // return false;
  }); // TODO? Decide what to return when no valid table names were matched.
}

export function filterTablesWithSets(tables: Array<Table>, pickTableNames: Array<string> | 'full' | undefined, format: 'include' | 'exclude'): Array<string> {
  const tableNames: Set<string> = new Set<string>(tables.map((table) => table.name));

  if (pickTableNames === 'full' || !pickTableNames) {
    return format === 'include' ? Array.from(tableNames) : []; // TODO: make sure [] works with Dexie skipTables.
  }

  const pickNames = new Set(pickTableNames);

  if (!Set.prototype.intersection || !Set.prototype.difference) {
    throw new Error('Set methods not supported.');
  }

  const intersection: Set<string> = tableNames.intersection(pickNames);

  const result: Set<string> = format === 'include' ? intersection : tableNames.difference(intersection);

  return Array.from(result);
}
