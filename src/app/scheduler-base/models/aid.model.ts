import { UpdateSpecWithoutPropModification } from '../../models/db-event-type.model';
import { mapFromDbAvailability, mapToDbAvailability } from '../../utils/db.utils';
import { InsertDbType, UpdateDbChanges } from './db.types';
import { Person, PersonScheduleDbUpdate } from './person-type.model';
import { availabilityIsScheduleTimeArray, DbEntryWithTemporalType, ScheduleTime } from './schedule-time.model';

export interface Aid extends Person {
  id: number;
  name: string;
  // proficiencies: Array<string>;
  // schedule2: PersonSchedule;
}
export type DbAidChanges = Omit<UpdateDbChanges<Aid>, 'schedule'> & PersonScheduleDbUpdate;

export type DbAid = Omit<Aid, 'schedule'> & PersonScheduleDbUpdate;

export function toAid(id: number, dbAid: InsertDbType<DbAid>): Aid {
  return {
    ...dbAid,
    id: id, // Setting the id may not actually be needed, but just in case, make sure it is set before adding it to the store.
    schedule: mapFromDbAvailability(dbAid.schedule),
    // schedule2: {
    //   ...dbAid.schedule2,
    //   availability: [...dbAid.schedule2.availability!],
    // }
  };
}

export function toAids(aids: Array<DbAid>): Array<Aid> {
  return aids.map((aid: DbAid) => {
    return {
      ...aid,
      schedule: mapFromDbAvailability(aid.schedule),
      // schedule2: {
      //   ...aid.schedule2,
      //   availability: [...aid.schedule2.availability!],
      // }
    };
  });
}

export function toDbAidChanges(aid: Aid | DbAid | UpdateDbChanges<Aid> | InsertDbType<DbAid>): DbAidChanges {
  let schedule: Array<DbEntryWithTemporalType<ScheduleTime>> = [];
  if (availabilityIsScheduleTimeArray(aid.schedule)) {
    schedule = mapToDbAvailability(aid.schedule);
  } else {
    schedule = [...aid.schedule ?? []];
  }

  return {
    ...aid,
    schedule: schedule,
  };
}

export function toDbAid(aidId: number, aid: UpdateSpecWithoutPropModification<Aid>): UpdateSpecWithoutPropModification<DbAid> {
  let schedule: Array<DbEntryWithTemporalType<ScheduleTime>> | undefined = undefined;
  if (availabilityIsScheduleTimeArray(aid.schedule)) {
    schedule = mapToDbAvailability(aid.schedule);
  }  else if (aid.schedule) {
    schedule = [...aid.schedule];
  } else {
    schedule = undefined;
  }

  return {
    ...aid,
    id: aidId,
    schedule: schedule,
    // name: aid.name ?? '',
  };
}

export function fromDbAids(aids: Array<DbAid>): Array<Aid> {
  return aids.map(fromDbAid);
}

export function fromDbAid(aid: DbAid): Aid {
  return {
    ...aid,
    schedule: mapFromDbAvailability(aid.schedule),
  };
}
