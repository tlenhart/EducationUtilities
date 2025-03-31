import { UpdateSpecWithoutPropModification } from '../../models/db-event-type.model';
import { BehaviorId } from '../../models/observation.model';
import { mapFromDbAvailability, mapToDbAvailability } from '../../utils/db.utils';
import { UpdateDbChanges } from './db.types';
import { Person, PersonId, PersonScheduleDbUpdate } from './person-type.model';
import { availabilityIsScheduleTimeArray, DbEntryWithTemporalType, ScheduleTime } from './schedule-time.model';

export interface Minutes {
  id: number;
  subject: string;
  minutes: number;
}

export interface Student extends Person {
  minutes: Array<Minutes>;
  behaviors: Array<BehaviorId>;
  testBehaviors: Set<BehaviorId>;
}

export type DbStudent = Omit<Student, 'schedule'> & PersonScheduleDbUpdate;
export type DbStudentChanges = Omit<UpdateDbChanges<Student>, 'schedule'> & PersonScheduleDbUpdate;

export function fromDbStudent(dbStudent: DbStudent): Student {
  return {
    ...dbStudent,
    schedule: mapFromDbAvailability(dbStudent.schedule),
  };
}

export function fromDbStudents(dbStudents: Array<DbStudent>): Array<Student> {
  return dbStudents.map(fromDbStudent);
}

export function toDbStudent(studentId: PersonId, student: UpdateSpecWithoutPropModification<Student>): UpdateSpecWithoutPropModification<DbStudent> {
  let schedule: Array<DbEntryWithTemporalType<ScheduleTime>> | undefined = undefined;
  if (availabilityIsScheduleTimeArray(student.schedule)) {
    schedule = mapToDbAvailability(student.schedule);
  } else if (student.schedule) {
    schedule = [...student.schedule];
  } else {
    schedule = undefined;
  }

  return {
    ...student,
    id: studentId,
    schedule: schedule,
    // behaviors: student.behaviors ?? [],
  };
}
