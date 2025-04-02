import { inject, Signal } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalMethod,
  signalStore,
  signalStoreFeature,
  type,
  withHooks,
  withMethods, withProps,
  withState,
} from '@ngrx/signals';
import {
  addEntity,
  entityConfig, EntityId,
  NamedEntityState,
  removeEntity,
  setAllEntities,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { Table } from 'dexie';
import { from, pipe, switchMap, take, tap } from 'rxjs';
import { setLoading, withLoadingStatus } from '../../shared/stores/features/loading-status.store.feature';
import {
  withAutomaticallyLoadEntitiesForScheduleIdChange
} from '../../shared/stores/features/schedule-id-changes.store.feature';
import { withSelectedEntity } from '../../shared/stores/features/selected-entity.store.feature';
import { schedulerDb } from '../db/scheduler.db';
import { Aid } from '../models/aid.model';
import { DbPerson, toDbPerson, toPeople } from '../models/person-type.model';
import { DbTeacher, Teacher } from '../models/teacher.model';
import { ScheduleStore } from './schedule.store';
import { withPartialBackgroundSaveToDb } from '../../shared/stores/features/partial-background-save-to-db.store.feature';
import { InsertDbType } from '../models/db.types';
import { UpdateSpecWithoutPropModification } from '../../models/db-event-type.model';

interface TeacherState extends NamedEntityState<Teacher, 'teacher'> {
  teachers: Array<Teacher>;
  isLoading: boolean;
  filter: { query: string, order: 'asc' | 'desc' };
}

const initialState: TeacherState = {
  teachers: [
    {
      id: 1,
      name: 'Mr. Anderson',
      availability: [],
      homeroom: 'Computers',
    },
    {
      id: 2,
      name: 'Mr. Bueller',
      availability: [],
      homeroom: 'GenPop',
    },
    {
      id: 3,
      name: 'Mr. Lorensax',
      availability: [],
      homeroom: 'Econ 101',
    },
  ],
  isLoading: false,
  filter: { query: '', order: 'desc' },
  // teacherIds: [], // [1, 2, 3],
  // teacherEntityMap: {},
} as unknown as TeacherState;

const teacherStoreConfig = entityConfig({
  entity: type<Teacher>(),
  collection: 'teacher',
  // selectId: (teacher: Teacher) => teacher.id,
});

export const TeacherStore = signalStore(
  // withState(initialState),
  // withEntities<Teacher>(teacherStoreConfig),
  withEntities<Teacher>({
    entity: type<Teacher>(),
  }),
  withSelectedEntity<Teacher>(),
  withLoadingStatus(),
  // withLoadTeachers(),
  // withLoadTeachersForSchedule(),
  withAutomaticallyLoadEntitiesForScheduleIdChange(schedulerDb.teachers),
  withPartialBackgroundSaveToDb(new Worker(new URL('./teacher.db.worker.ts', import.meta.url), { type: 'module' })),
  withMethods((store) => ({
    async addTeacher(teacher: InsertDbType<Teacher>): Promise<void> {
      // store.addToDb(teacher); // ! Won't work because we need the id back.
      // TODO: Handle errors here!
      const id = await schedulerDb.teachers.add(toDbPerson(teacher));

      const newTeacher: Teacher = {
        ...teacher,
        id: id,
      };
      patchState(store, addEntity(newTeacher));
      // TODO: Does the id need to be returned to the caller, or is it just going to be added...
    },
    updateTeacher(id: EntityId, changes: UpdateSpecWithoutPropModification<Teacher>): void {
      if (id) {
        // TODO: Check for success? (Or perform rollback?)
        // TODO: Notify of errors.
        store.updateDb(typeof id === 'string' ? parseInt(id, 10) : id, changes);

        // console.warn(store.selectedEntity(), id, changes);
        patchState(store, updateEntity({
          id: id,
          changes: (teacher) => ({ name: changes.name }),
        }));
      }
    },
    removeTeacher(teacher: Teacher): void {
      store.removeFromDb(teacher.id);
      patchState(store, removeEntity(teacher.id));
    },
  })),
  // withProps((store) => ({
  //   loadTeachersSignal: signalMethod<EntityId | null>(async (scheduleId: EntityId | null) => {
  //     try {
  //       if (scheduleId === null) {
  //         return;
  //       }
  //
  //       const teachers = await schedulerDb.teachers.where({ scheduleId: scheduleId }).toArray();
  //
  //       patchState(store, setAllEntities(toPeople(teachers)));
  //     } catch (e: unknown) {
  //       // TODO: Clear the database.
  //       console.error('Error while loading teachers from the local db.', e);
  //     }
  //   }),
  // })),
  // withHooks({
  //   onInit(store, scheduleStore = inject(ScheduleStore)) {
  //     // loadTeachersSignal = signalMethod<number>(async (scheduleId: number) => {
  //     //   try {
  //     //     const teachers = await schedulerDb.teachers.where({ scheduleId: scheduleId }).toArray();
  //     //
  //     //     patchState(store, setAllEntities(toPeople(teachers)));
  //     //   } catch (e: unknown) {
  //     //     // TODO: Clear the database.
  //     //     console.error('Error while loading teachers from the local db.', e);
  //     //   }
  //     // });
  //     //
  //     // loadTeachersSignal(scheduleStore.selectedEntityId as Signal<number>);
  //     store.loadTeachersSignal(scheduleStore.selectedEntityId);
  //   },
  //   onDestroy(store) {
  //     // TODO: May not be necessary.
  //     store.loadTeachersSignal?.destroy();
  //   },
  // }),
);

function withLoadTeachers() {
  return signalStoreFeature(
    withMethods((store, scheduleStore = inject(ScheduleStore)) => ({
      // TODO: Use signalMethod instead? https://ngrx.io/guide/signals/signal-method
      // TODO: Look into updating the store automatically when the scheduleId changes.
      // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
      loadTeachers: rxMethod<void>(
        pipe(
          tap(() => {
            console.log('loading teachers');
            patchState(store, setLoading(true));
          }),
          switchMap(() => {
            return from(schedulerDb.teachers.where({ scheduleId: scheduleStore.selectedEntityId() }).toArray())
              .pipe(
                take(1),
                tapResponse({
                  next: (teachers: Array<DbTeacher>) => {
                    console.log('loaded teachers', teachers);
                    // patchState(store, setAllEntities(toAids(teachers), aidStoreConfig));
                    patchState(store, setAllEntities(toPeople(teachers)));
                  },
                  error: (error: unknown) => {
                    console.error(error);
                  },
                  finalize: () => {
                    console.log('finalize loading aids.');
                    patchState(store, setLoading(false));
                  },
                }),
              );
          }),
        ),
      ),
    })),
  );
}

// TODO: MAKE SURE THIS ISN"T GOING TO LEAK MEMORY.
function withLoadTeachersForSchedule() {
  return signalStoreFeature(
    // TODO: Perhaps this signal should be done in the ngOnInit for the store itself, and then perhaps the changes could be tracked
    //  and it doesn't need to be called in scheduleIdResolver().
    withMethods((store, scheduleStore = inject(ScheduleStore)) => ({
      loadTeachersForSchedule: signalMethod<number>(async (scheduleId: number) => {
        try {
          const teachers = await schedulerDb.teachers.where({ scheduleId: scheduleId }).toArray();

          patchState(store, setAllEntities(toPeople(teachers)));
        } catch (e: unknown) {
          // TODO: Clear the database.
          console.error('Error while loading teachers from the local db.', e);
        }
      }),
    })),
  );
}

// const initialState: TeacherState = {
//   teachers: [
//     {
//       id: 1,
//       name: 'Mr. Anderson',
//       availability: [],
//       homeroom: 'Computers',
//     },
//     {
//       id: 2,
//       name: 'Mr. Bueller',
//       availability: [],
//       homeroom: 'GenPop',
//     },
//     {
//       id: 3,
//       name: 'Mr. Lorensax',
//       availability: [],
//       homeroom: 'Econ 101',
//     },
//   ],
//   isLoading: false,
//   filter: { query: '', order: 'desc' },
// };
//
// const teacherStoreConfig = entityConfig({
//   entity: type<Teacher>(),
//   collection: 'teacher',
//   // selectId: (teacher: Teacher) => teacher.id,
// });
//
// export const TeacherStore = signalStore(
//   withState(initialState),
//   withEntities<Teacher>(teacherStoreConfig),
//   // withEntities<Teacher>(),
//   withSelectedEntity(),
//   withMethods((store) => ({
//     addTeacher(teacher: Teacher): void {
//       patchState(store, addEntity(teacher, teacherStoreConfig));
//     },
//     removeTeacher(teacher: Teacher): void {
//       patchState(store, removeEntity(teacher.id));
//     },
//   })),
// );
//
// export interface SelectedEntityState { selectedEntityId: EntityId | null }
//
// export function withSelectedEntity<TEntity>() {
//   return signalStoreFeature(
//     { state: type<EntityState<TEntity>>() },
//     withState<SelectedEntityState>({ selectedEntityId: null }),
//     withComputed(({ entityMap, selectedEntityId }) => ({
//       selectedEntity: computed(() => {
//         const selectedId = selectedEntityId();
//         return selectedId ? entityMap()[selectedId] : null;
//       }),
//     })),
//   );
// }
