import { UpdateSpecWithoutPropModification } from '../../models/db-event-type.model';
import { mapFromDbAvailability, mapToDbAvailability } from '../../utils/db.utils';
import { DbBase } from './db.types';
import { DbEntryWithTemporalType, ScheduleTime } from './schedule-time.model';
import { AssociatedSchedule } from './schedule.model';

export type PersonType = 'teacher' | 'student' | 'aid';

export type PersonId = number;

export type AvailabilitySchedule = Array<ScheduleTime>;

export interface PersonSchedule {
  availability?: AvailabilitySchedule;
}

export interface Person extends DbBase<PersonId>, AssociatedSchedule {
  name: string,
  schedule: AvailabilitySchedule;
}

export interface PersonScheduleDbUpdate {
  schedule?: Array<DbEntryWithTemporalType<ScheduleTime>>; // undefined is allowed to prevent the possibility of overriding the schedule when doing partial updates.
}

export type DbPerson = Omit<Person, 'schedule'> & PersonScheduleDbUpdate;

export function toPeople<T = Person>(people: Array<DbPerson>): Array<T> {
  return people.map(toPerson) as Array<T>;
}

export function toDbPeople<T = DbPerson>(people: Array<UpdateSpecWithoutPropModification<Person>>): Array<T> {
  return people.map(toDbPerson) as Array<T>;
}

export function toPerson<T = Person>(person: DbPerson): T {
  return {
    ...person,
    schedule: mapFromDbAvailability(person.schedule),
  } as T;
}

export function toDbPerson<T = DbPerson>(person: UpdateSpecWithoutPropModification<Person>): T {
  return {
    ...person,
    schedule: person.schedule ? mapToDbAvailability(person.schedule) : undefined, // Only set the schedule when it is provided by the parameter.
  } as T;
}
