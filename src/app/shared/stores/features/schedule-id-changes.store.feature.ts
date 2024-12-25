// TODO: Using a direct table reference, passed in like this, may not be a good idea.
import { inject } from '@angular/core';
// TODO: Especially when dealing with a database that may or may not be closed... (Unknown though.)
import { patchState, signalMethod, signalStoreFeature, withHooks, withProps } from '@ngrx/signals';
import { EntityId, setAllEntities } from '@ngrx/signals/entities';
import { Table } from 'dexie';
import { DbPerson, toPeople } from '../../../scheduler-base/models/person-type.model';
import { ScheduleStore } from '../../../scheduler-base/stores/schedule.store';

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
        // TODO: May not be necessary.
        store._loadSignal.destroy();
      },
    }),
  );
}
