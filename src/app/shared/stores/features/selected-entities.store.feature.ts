import { computed } from '@angular/core';
import { patchState, signalStoreFeature, type, withComputed, withMethods, withState } from '@ngrx/signals';
import { EntityId, EntityMap, EntityState } from '@ngrx/signals/entities';
import { Table } from 'dexie';

export interface SelectedEntitiesState {
  selectedEntityIdSet: Set<EntityId>;
}

export function withSelectedEntities<TEntity>() {
  return signalStoreFeature(
    { state: type<EntityState<TEntity>>() },
    withState<SelectedEntitiesState>({
      selectedEntityIdSet: new Set<EntityId>(),
    }),
    withMethods((store) => ({
      async addSelectedEntityAsync(entityId: EntityId, dbTable: Table): Promise<boolean> {
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

          // Entity exists, so add it.
          patchState(store, (state) => {
            return {
              ...state,
              selectedEntityIdSet: new Set(state.selectedEntityIdSet).add(entityId),
            };
          });

          return true;
        }

        return false;
      },
      removeSelectedEntity(entityId: EntityId): void {
        patchState(store, (state) => {
          const clonedState = {
            ...state,
            selectedEntityIdSet: new Set(state.selectedEntityIdSet),
          };

          clonedState.selectedEntityIdSet.delete(entityId);

          return {
            ...clonedState,
          };
        });
      },
    })),
    withComputed(({ entityMap, selectedEntityIdSet }) => ({
      selectedEntities: computed(() => {
        const selectedEntityIds = selectedEntityIdSet();

        if (selectedEntityIds.size > 0) {
          const entities: EntityMap<TEntity> = entityMap();
          return Array.from(selectedEntityIds).map((entityId) => entities[entityId]);
        } else {
          return [];
        }
      }),
      selectedEntityIdsNumeric: computed(() => {
        const entityIds = selectedEntityIdSet();

        return Array.from(entityIds).map((entityId) => {
          return typeof entityId === 'string'
            ? parseInt(entityId, 10)
            : entityId;
        });
      }),
    })),
  );
}
