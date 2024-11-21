import { Person } from './person-type.model';
import { ScheduleTime } from './schedule-time.model';

export interface Teacher extends Person {
  room: string;
  availability: Array<ScheduleTime>;
  // proficiencies: Array<string>;
}
