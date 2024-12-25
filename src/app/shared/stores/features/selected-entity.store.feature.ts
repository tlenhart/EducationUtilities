import { computed } from '@angular/core';
import { patchState, signalStoreFeature, type, withComputed, withMethods, withState } from '@ngrx/signals';
import { EntityId, EntityState } from '@ngrx/signals/entities';
import { Table } from 'dexie';

export interface SelectedEntityState { selectedEntityId: EntityId | null }

export function withSelectedEntity<TEntity>() {
  return signalStoreFeature(
    { state: type<EntityState<TEntity>>() },
    withState<SelectedEntityState>({ selectedEntityId: null }),
    withMethods((store) => ({
      setSelectedEntity: (entityId: EntityId): boolean => {
        console.log('set selectedEntity', entityId);
        // TODO: Check if entity exists. If it does not, return false;
        // const exists = await schedulerDb.schedules.get(entityId as number ?? -1);
        // if (!exists) {
        //   return false;
        // }

        if (typeof entityId === 'string') {
          entityId = parseInt(entityId, 10);
        }

        // TODO: Deal with non-existent ids.
        if (!isNaN(entityId)) {
          patchState(store, { selectedEntityId: entityId });
          return true;
        }

        patchState(store, { selectedEntityId: null });
        return false;
      },
      setSelectedEntityAsync: async (entityId: EntityId, dbTable: Table): Promise<boolean> => {
        console.log('set selectedEntity2', entityId);

        if (typeof entityId === 'string') {
          entityId = parseInt(entityId, 10);
        }

        if (!isNaN(entityId)) {
          // Check if entity exists in the database. If it does not, return false;
          // TODO: Maybe check the store as well as the database.
          const exists = await dbTable.get(entityId);
          if (!exists) {
            return false;
          }

          // Entity exists, so set it.
          patchState(store, { selectedEntityId: entityId });
          return true;
        }

        patchState(store, { selectedEntityId: null });
        return false;
      },
    })),
    withComputed(({ entityMap, selectedEntityId }) => ({
      selectedEntity: computed(() => {
        const selectedId = selectedEntityId();
        return selectedId ? entityMap()[selectedId] : null;
      }),
      selectedEntityIdNumeric: computed(() => {
        const entityId = selectedEntityId();
        if (entityId) {
          return typeof entityId === 'string'
            ? parseInt(entityId, 10)
            : entityId;
        }

        return -1;
      })
    })),
  );
}
