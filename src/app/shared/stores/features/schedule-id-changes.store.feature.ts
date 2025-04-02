// TODO: Using a direct table reference, passed in like this, may not be a good idea.
import { inject } from '@angular/core';
// TODO: Especially when dealing with a database that may or may not be closed... (Unknown though.)
import { patchState, signalMethod, signalStoreFeature, withHooks, withMethods, withProps } from '@ngrx/signals';
import { EntityId, setAllEntities } from '@ngrx/signals/entities';
import { Table } from 'dexie';
import { DbPerson, toPeople } from '../../../scheduler-base/models/person-type.model';
import { ScheduleStore } from '../../../scheduler-base/stores/schedule.store';
import { resetLoaded, setLoaded, setLoading, withLoadingStatus } from './loading-status.store.feature';
import { withEntitiesType } from './with-entities-type.store.feature';

export function withAutomaticallyLoadEntitiesForScheduleIdChange<T = DbPerson, TKey = number, TInsertType = unknown>(dbTable: Table<T, TKey, TInsertType>) {
  return signalStoreFeature(
    withProps((store) => ({
      _loadSignal: signalMethod<EntityId | null>(async (scheduleId: EntityId | null) => {
        try {
          if (scheduleId === null) {
            return;
          }

          const entities: Array<DbPerson> = await dbTable.where({ scheduleId: scheduleId }).toArray() as Array<DbPerson>;

          // TODO: Need to handle toPeople setting an [] for schedule, instead of the property not being there at all.
          patchState(store, setAllEntities(toPeople(entities)));
        } catch (e: unknown) {
          // TODO: Clear the database.
          console.error('Error while loading teachers from the local db.', e);
        }
      }),
    })),
    withHooks({
      onInit(store, scheduleStore = inject(ScheduleStore)) {
        store._loadSignal(scheduleStore.selectedEntityId);
      },
      onDestroy(store) {
        // TODO: May not be necessary. (And probably doesn't work currently.)
        store._loadSignal.destroy();
      },
    }),
  );
}

export function withAutomaticallyLoadEntities<TStoreEntity extends {
  id: EntityId
}, TDbEntity, TDbEntityKey, TDbEntityUpdate>(dbTable: Table<TDbEntity, TDbEntityKey, TDbEntityUpdate>, dbConversionFn: (entity: Array<TDbEntity>) => Array<TStoreEntity>) {
  return signalStoreFeature(
    withLoadingStatus(),
    withEntitiesType<TStoreEntity>(),

    // TODO: See withLoadAids as an alternative approach.
    withMethods((store) => ({
      async loadEntities(): Promise<void> {
        try {
          patchState(store, setLoading(true));
          patchState(store, resetLoaded());

          const entities: Array<TDbEntity> = await dbTable.toArray();

          patchState(store, setAllEntities<TStoreEntity>(dbConversionFn(entities)));
          patchState(store, setLoading(false));
          patchState(store, setLoaded(true));
        } catch (error: unknown) {
          patchState(store, setLoading(false));
          patchState(store, setLoaded(false));

          console.error('Error while loading items from local db.', error);
        }
      },
    })),
    withHooks({
      onInit(store): void {
        void (async () => {
          await store.loadEntities();
        })();
      },
    }),
  );
}
