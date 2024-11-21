import { DbBase } from './db.types';
import { ScheduleTime } from './schedule-time.model';
import { AssociatedSchedule } from './schedule.model';

export interface ScheduleGroup extends DbBase, AssociatedSchedule {
  // start: Temporal.PlainTime;
  // end: Temporal.PlainTime; // Could do time length instead.
  // dates:
  time: ScheduleTime;
  times?: Array<ScheduleTime>;
}
