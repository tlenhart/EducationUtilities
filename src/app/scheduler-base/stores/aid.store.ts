import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, signalStoreFeature, type, withComputed, withMethods } from '@ngrx/signals';
import {
  addEntity,
  entityConfig,
  removeEntity,
  setAllEntities,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { from, pipe, switchMap, take, tap } from 'rxjs';
import { setLoading, withLoadingStatus } from '../../shared/stores/features/loading-status.store.feature';
import {
  withAutomaticallyLoadEntitiesForScheduleIdChange,
} from '../../shared/stores/features/schedule-id-changes.store.feature';
import { withSelectedEntity } from '../../shared/stores/features/selected-entity.store.feature';
import { mapToDbAvailability } from '../../utils/db.utils';
import { schedulerDb } from '../db/scheduler.db';
import { Aid, DbAid, toAid, toAids, toDbAidChanges } from '../models/aid.model';
import { InsertDbType } from '../models/db.types';
import { DbEntryWithTemporalType, ScheduleTime } from '../models/schedule-time.model';

const aidStoreConfig = entityConfig({
  entity: type<Aid>(),
  collection: 'aid',
  selectId: (aid) => aid.id,
});

export const AidStore = signalStore(
  // withEntities(aidStoreConfig),
  withEntities<Aid>({
    entity: type<Aid>(),
  }),
  withSelectedEntity<Aid>(),
  withLoadingStatus(),
  withAddAid(),
  withAutomaticallyLoadEntitiesForScheduleIdChange(schedulerDb.aids),
  withMethods((store) => ({
    // TODO: Loook into SelectedEntityId and how that might work.
    getAid(aidId: number): Aid {
      return store.entityMap()[aidId];
    },
    removeAid(aid: Aid): void {
      // TODO: Remove from database.
      // TODO: Remove from references elsewhere.
      patchState(store, removeEntity(aid.id));
    },

    async updateSelectedAidName(name: string): Promise<void> {
      const selectedEntity = store.selectedEntity();

      if (!selectedEntity || !selectedEntity.id) {
        return;
      }

      const entriesUpdated: number = await schedulerDb.aids.update(selectedEntity.id, { name });

      // Only patch the state when the database update succeeded.
      if (entriesUpdated === 1) {
        patchState(
          store,
          updateEntity({
            id: selectedEntity.id,
            changes: (aid: Aid) => ({ name }),
          }),
        );
      } else {
        console.error(`Aid id: ${selectedEntity.id} not found.`);
      }
    },
    async updateSelectedAidAvailability(changes: Array<ScheduleTime>): Promise<void> {
      const aid = store.selectedEntity(); // TODO: Handle missing aids.

      if (!aid || !aid.id) {
        return;
      }

      const dbChanges: Array<DbEntryWithTemporalType<ScheduleTime>> = mapToDbAvailability(changes);

      const entriesUpdated: number = await schedulerDb.aids.update(aid.id, { schedule: dbChanges });

      console.log('schedule entries updated', entriesUpdated);

      // Only patch the state when the database update succeeded.
      if (entriesUpdated === 1) {
        // patchState(
        //   store,
        //   updateEntity({
        //     id: aidId,
        //     changes: (aid: Aid) => ({ schedule: [...changes] }),
        //   },
        //   aidStoreConfig),
        // );
        patchState(
          store,
          // TODO: Test how this works with selectedEntity.
          updateEntity({
            id: aid.id,
            changes: (aid: Aid) => ({ schedule: [...changes] }),
          }),
        );
      } else {
        console.error(`Aid id: ${aid.id} not found.`);
      }
    },

    // async updateAidName(aidId: number, name: string): Promise<void> {
    //   // TODO: See https://dexie.org/docs/Table/Table.update() for warnings about nested objects.
    //   // console.log(aidId, changes, await schedulerDb.aids.get(1), typeof aidId === 'string');
    //   const entriesUpdated: number = await schedulerDb.aids.update(aidId, { name });
    //   console.log('entriesUpdated', entriesUpdated);
    //
    //   // Only patch the state when the database update succeeded.
    //   if (entriesUpdated === 1) {
    //     patchState(
    //       store,
    //       updateEntity({
    //         id: aidId,
    //         changes: (aid: Aid) => ({ name }),
    //       },
    //       aidStoreConfig),
    //     );
    //   } else {
    //     console.error(`Aid id: ${aidId} not found.`, typeof aidId);
    //   }
    // },
    async updateAidAvailability(aidId: number, changes: Array<ScheduleTime>): Promise<void> {
      const aid = store.entities()[aidId]; // TODO: Handle missing aids.
      const dbChanges: Array<DbEntryWithTemporalType<ScheduleTime>> = mapToDbAvailability(changes);

      const entriesUpdated: number = await schedulerDb.aids.update(aidId, { schedule: dbChanges });


      // Only patch the state when the database update succeeded.
      if (entriesUpdated === 1) {
        console.warn('schedule entries updated2', entriesUpdated);
        patchState(
          store,
          updateEntity({
            id: aidId,
            changes: (aid: Aid) => ({ schedule: [...changes] }),
          }),
        );
      } else {
        console.error(`Aid id: ${aidId} not found.2`, typeof aidId);
      }

      // TODO: Patch state.
    },
    async updateAidAvailability3(aidId: number, newItem: ScheduleTime): Promise<void> {
      const aid = store.entities()[aidId]; // TODO: Handle missing aids.
      const dbChanges: Array<DbEntryWithTemporalType<ScheduleTime>> = mapToDbAvailability([...aid.schedule, newItem]);

      const entriesUpdated: number = await schedulerDb.aids.update(aidId, { schedule: dbChanges });

      // Only patch the state when the database update succeeded.
      if (entriesUpdated === 1) {
        console.warn('schedule entries updated3', entriesUpdated);
        patchState(
          store,
          updateEntity({
            id: aidId,
            changes: (aid: Aid) => ({ schedule: [...aid.schedule, newItem] }),
          }),
        );
      } else {
        console.error(`Aid id: ${aidId} not found.2`, typeof aidId);
      }

      // TODO: Patch state.
    },
  })),
  withComputed((store) => ({
    // test: computed(() => {
    //   const entities = store.entities();
    //
    //   console.log('entities', entities);
    // }),
  })),
);

function withAddAid() {
  return signalStoreFeature(
    withMethods((store) => ({
      async addAid(aid: InsertDbType<DbAid>): Promise<boolean> {
        try {
          const newId: number = await schedulerDb.aids.add(toDbAidChanges(aid));
          const newAid: Aid = toAid(newId, aid);

          patchState(store, addEntity(newAid, aidStoreConfig));
          return true;
        } catch (error: unknown) {
          console.error('Error while adding a new aid to the database or store.', error);
          return false;
        }
      },
    })),
  );
}

function withLoadAids() {
  return signalStoreFeature(
    withMethods((store) => ({
      // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
      loadAids: rxMethod<void>(
        pipe(
          tap(() => {
            console.log('loading aids.');
            patchState(store, setLoading(true));
          }),
          switchMap(() => {
            return from(schedulerDb.aids.toArray())
              .pipe(
                take(1),
                tapResponse({
                  next: (aids: Array<DbAid>) => {
                    console.log('loaded aids', aids);
                    // patchState(store, setAllEntities(toAids(aids), aidStoreConfig));
                    patchState(store, setAllEntities(toAids(aids)));
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

// type AidState = {
//   aids: Array<Aid>;
// };
//
// const initialState: AidState = {
//   aids: [
//     {
//       id: 1,
//       name: 'Test',
//     },
//     {
//       id: 2,
//       name: 'Test 2',
//     },
//   ],
// };
//
// export const AidStore = signalStore(
//   // { providedIn: 'root' },
//   withState(initialState),
//   withMethods((store) => ({
//     addAid(aidName: string): void {
//       patchState(store, {
//         aids: [...store.aids(), { id: 2, name: aidName }],
//       });
//     }
//   })),
// );
