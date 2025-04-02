/// <reference lib="webworker" />

import { concatMap, from, Subject } from 'rxjs';
import { schedulerDb } from '../db/scheduler.db';
import { DbPerson, toDbPerson } from '../models/person-type.model';
import { DbWorkerChange, DbWorkerModification, UpdateSpecWithoutPropModification } from '../../models/db-event-type.model';
import { InsertDbType } from '../models/db.types';
import { DbTeacher, Teacher, toDbTeacher } from '../models/teacher.model';

const updateQueue = new Subject<DbWorkerChange<Teacher>>();
const updateQueueSubscription = updateQueue.pipe(
  // TODO: May want to do something to make sure the db is populated before pushing new items.
  // TODO: Also, maybe delay a bit so we aren't constantly writing to the database.
  concatMap((teacher: DbWorkerChange<Teacher>) => {
    const dbTeacher: UpdateSpecWithoutPropModification<DbTeacher> = toDbTeacher(teacher.id, teacher.data);
    return from(schedulerDb.teachers.update(teacher.id, { ...dbTeacher }));
  }),
).subscribe({
  next: (numUpdated: number) => {
    console.warn('Teacher table updated', numUpdated);
  },
  error: (error: unknown) => {
    console.warn('db teacher table update error', error);
  }
});

addEventListener('message', ({ data }: MessageEvent<DbWorkerModification<Teacher, InsertDbType<Teacher> | void>>) => {
  // If the hasLoaded property is on the object, delete it so it doesn't get stored in the database.
  // if (data?.data && Object.hasOwn(data.data, 'hasLoaded')) {
  //   delete data.data.hasLoaded;
  // }

  if (data.eventType === 'update') {
    updateQueue.next(data);
  } else if (data.eventType === 'add') {
    const dbTeacher: DbPerson = toDbPerson(data.data);
    void (async () => {
      await schedulerDb.teachers.put(dbTeacher);
    })();
  } else if (data.eventType === 'export') {
    void (async () => {
      const result = await schedulerDb.exportDb(data.tables);
      console.warn('export teacher result', result);
    })();
  } else if (data.eventType === 'delete') {
    void (async () => {
      const result = await schedulerDb.teachers.delete(data.id);
      console.warn('delete teacher result', result);
    })();
  }
});

// TODO: Post message when new item added. (For example with the scheduler.)

