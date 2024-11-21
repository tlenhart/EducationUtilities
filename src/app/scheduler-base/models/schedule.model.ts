import { DbBase } from './db.types';

export interface Schedule extends DbBase {
  title: string;
}

/**
 * School-wide schedule.
 */
export interface GlobalSchedule {
}

export interface AssociatedSchedule {
  scheduleId?: number; // TODO: Should this be a join table instead of being a property on each item?
}
