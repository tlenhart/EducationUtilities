import { computed } from '@angular/core';
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
import { schedulerDb } from '../db/scheduler.db';
import { Aid } from '../models/aid.model';
import { InsertDbType, UpdateDbChanges } from '../models/db.types';
import { setLoading, withLoadingStatus } from '../../shared/stores/features/loading-status.store.feature';

const aidStoreConfig = entityConfig({
  entity: type<Aid>(),
  collection: 'aid',
  selectId: (aid) => aid.id,
});

export const AidStore = signalStore(
  withEntities(aidStoreConfig),
  withLoadingStatus(),
  withAddAid(),
  withLoadAids(),
  withMethods((store) => ({
    // TODO: Loook into SelectedEntityId and how that might work.
    getAid(aidId: number): Aid {
      return store.aidEntityMap()[aidId];
    },
    removeAid(aid: Aid): void {
      // TODO: Remove from database.
      // TODO: Remove from references elsewhere.
      patchState(store, removeEntity(aid.id, aidStoreConfig));
    },
    async updateAid(aidId: number, changes: UpdateDbChanges<Aid>): Promise<void> {
      // TODO: See https://dexie.org/docs/Table/Table.update() for warnings about nested objects.
      console.log(aidId, changes, await schedulerDb.aids.get(1), typeof aidId === 'string');
      const entriesUpdated: number = await schedulerDb.aids.update(aidId, changes);
      console.log('entriesUpdated', entriesUpdated);

      // Only patch the state when the database update succeeded.
      if (entriesUpdated === 1) {
        patchState(
          store,
          updateEntity({
            id: aidId,
            changes: (aid: Aid) => ({ ...changes }),
          },
          aidStoreConfig),
        );
      } else {
        console.error(`Aid id: ${aidId} not found.`, typeof aidId);
      }
    },
  })),
  withComputed((store) => ({
    test: computed(() => {
      const entities = store.aidEntities();

      console.log('entities', entities);
    }),
  })),
);

function withAddAid() {
  return signalStoreFeature(
    withMethods((store) => ({
      async addAid(aid: InsertDbType<Aid>): Promise<boolean> {
        const newAid: Aid = aid as Aid;

        try {
          const newId: number = await schedulerDb.aids.add(newAid);
          newAid.id = newId; // This may not actually be needed, but just in case, make sure it is set before adding it to the store.

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
            patchState(store, setLoading(true));
          }),
          switchMap(() => {
            return from(schedulerDb.aids.toArray())
              .pipe(
                take(1),
                tapResponse({
                  next: (aids: Array<Aid>) => {
                    patchState(store, setAllEntities(aids, aidStoreConfig));
                  },
                  error: (error: unknown) => {
                    console.error(error);
                  },
                  finalize: () => {
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
