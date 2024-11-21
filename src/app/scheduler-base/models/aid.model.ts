import { Person } from './person-type.model';
import { ScheduleTime } from './schedule-time.model';

export interface Aid extends Person {
  id: number;
  name: string;
  availability?: Array<ScheduleTime>;
  // proficiencies: Array<string>;
}
