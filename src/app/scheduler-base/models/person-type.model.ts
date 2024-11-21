import { DbBase, InsertDbType } from './db.types';
import { AssociatedSchedule } from './schedule.model';

export type PersonType = 'teacher' | 'student' | 'aid';

export interface Person extends DbBase, AssociatedSchedule {
  name: string,
}

const p: InsertDbType<Person> = {
  name: 'test',
  scheduleId: 1,
};

console.log(p);
