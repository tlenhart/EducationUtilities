import { DbBase, UpdateDbChanges } from './db.types';

export interface Schedule extends DbBase {
  title: string;
}

// ? Partial?
// export type DbScheduleChanges = Omit<UpdateDbChanges<Schedule>, 'schedule'> & PersonScheduleDbUpdate;
export type DbScheduleChanges = UpdateDbChanges<Schedule>;

export type DbSchedule = Schedule;

/**
 * School-wide schedule.
 */
export interface GlobalSchedule {
}

export interface AssociatedSchedule {
  scheduleId?: number; // TODO: Should this be a join table instead of being a property on each item?
}
