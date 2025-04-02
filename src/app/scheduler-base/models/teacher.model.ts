import { UpdateSpecWithoutPropModification } from '../../models/db-event-type.model';
import { mapToDbAvailability } from '../../utils/db.utils';
import { UpdateDbChanges } from './db.types';
import { Person, PersonScheduleDbUpdate } from './person-type.model';
import { DbEntryWithTemporalType, ScheduleTime, availabilityIsScheduleTimeArray } from './schedule-time.model';

export interface Teacher extends Person {
  room: string;
  // proficiencies: Array<string>;
}

// ? Partial?
export type DbTeacherChanges = Omit<UpdateDbChanges<Teacher>, 'schedule'> & PersonScheduleDbUpdate;

export type DbTeacher = Omit<Teacher, 'schedule'> & PersonScheduleDbUpdate;

export function toDbTeacher(teacherId: number, teacher: UpdateSpecWithoutPropModification<Teacher>): UpdateSpecWithoutPropModification<DbTeacher> {
  let schedule: Array<DbEntryWithTemporalType<ScheduleTime>> | undefined = undefined;
  if (availabilityIsScheduleTimeArray(teacher.schedule)) {
    schedule = mapToDbAvailability(teacher.schedule);
  } else if (teacher.schedule) {
    schedule = [...teacher.schedule];
  } else {
    schedule = undefined;
  }

  return {
    ...teacher,
    id: teacherId,
    schedule: schedule,
  };
}
