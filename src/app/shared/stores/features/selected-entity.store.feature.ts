import { computed } from '@angular/core';
import { patchState, signalStoreFeature, type, withComputed, withMethods, withState } from '@ngrx/signals';
import { EntityId, EntityState } from '@ngrx/signals/entities';

export interface SelectedEntityState { selectedEntityId: EntityId | null }

export function withSelectedEntity<TEntity>() {
  return signalStoreFeature(
    { state: type<EntityState<TEntity>>() },
    withState<SelectedEntityState>({ selectedEntityId: null }),
    withMethods((store) => ({
      setSelectedEntity: (entityId: EntityId): boolean => {
        console.log('set selectedEntity', entityId);
        // TODO: Check if entity exists. If it does not, return false;

        if (entityId === 1) {
          patchState(store, { selectedEntityId: entityId });
          return true;
        }

        patchState(store, { selectedEntityId: null });
        return false;
      }
    })),
    withComputed(({ entityMap, selectedEntityId }) => ({
      selectedEntity: computed(() => {
        const selectedId = selectedEntityId();
        return selectedId ? entityMap()[selectedId] : null;
      }),
    })),
  );
}
