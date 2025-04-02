import { computed, effect } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalStoreFeature,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { EntityId } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { liveQuery, Table } from 'dexie';
import { from, pipe } from 'rxjs';
import { withEntitiesType } from './with-entities-type.store.feature';

export interface SelectedMultipleEntitiesState<TEntity, TEntityId extends EntityId> {
  primaryEntityId: TEntityId | null,
  primaryEntity: TEntity | null,
  configurationEntityId: TEntityId | null,
  configurationEntity: TEntity | null,
}

export function withMultipleSelectedEntities<TStoreEntity extends {
  id: EntityId
}, TDbEntity, TDbEntityKey extends EntityId, TDbEntityUpdate = TDbEntity>(dbTable: Table<TDbEntity, TDbEntityKey, TDbEntityUpdate>, dbConversionFn: (entity: TDbEntity) => TStoreEntity) {
  return signalStoreFeature(
    withEntitiesType<TStoreEntity>(),
    withState<SelectedMultipleEntitiesState<TStoreEntity, TDbEntityKey>>({
      primaryEntity: null,
      primaryEntityId: null,
      configurationEntityId: null,
      configurationEntity: null, // ! This is set in the _configurationEntityLoader in the rxMethod tabResponse.
    }),
    withProps((store) => ({
      _primaryEntityLoader: rxMethod<TDbEntity | null | undefined>(
        pipe(
          tapResponse({
            next: (foundEntity) => {
              if (!foundEntity) {
                return;
              }

              // primaryEntity is set here.
              patchState(store, { primaryEntity: { ...dbConversionFn(foundEntity) } });
            },
            error: console.error,
          }),
        ),
      ),
      _configurationEntityLoader: rxMethod<TDbEntity | null | undefined>(
        pipe(
          tapResponse({
            next: (foundEntity) => {
              if (!foundEntity) {
                return;
              }

              // configurationEntity is set here.
              patchState(store, { configurationEntity: { ...dbConversionFn(foundEntity) } });
            },
            error: console.error,
          }),
        ),
      ),
    })),
    withMethods((store) => ({
      setPrimaryEntity(entityId: TDbEntityKey): boolean {
        if (!store.entityMap()[entityId]) {
          // TODO: Might cause problems if there is a mismatch between the store and the db.
          // TODO: Also, this doesn't account for whether or not the entity is in the database.
          return false;
        }

        patchState(store, { primaryEntityId: entityId });

        return true;
      },
      setConfigurationEntity(entityId: TDbEntityKey): boolean {
        if (!store.entityMap()[entityId]) {
          // TODO: Might cause problems if there is a mismatch between the store and the db.
          // TODO: Also, this doesn't account for whether or not the entity is in the database.
          return false;
        }

        patchState(store, { configurationEntityId: entityId });

        return true;
      },
    })),
    withHooks((store) => ({
      onInit(): void {
        // TODO: If this is working right, this, along with the rxMethod should allow database changes to be automatically propagated to the primary identity.
        effect(() => {
          const primaryEntityId = store.primaryEntityId();

          // store._primaryEntityLoader.destroy(); // TODO: Determine if destroy() needs to be called.

          store._primaryEntityLoader(from(liveQuery(() => {
            // ! TODO: Figure out why using a fixed value `const primaryEntityId = store.primaryEntityId();`
            //    causes new values to be loaded here, rather than using the signal directly.
            return dbTable.where('id').equals(store.primaryEntityId() ?? -1).first();
          })));
        });

        // TODO: If this is working right, this, along with the rxMethod should allow database changes to be automatically propagated to the configuration identity.
        effect(() => {
          const configurationEntityId = store.configurationEntityId();
          console.warn('configuration entity loader id changed.', configurationEntityId);

          // store._configurationEntityLoader.destroy();

          // store._configurationEntityLoader.destroy(); // TODO: Determine if destroy() needs to be called.
          store._configurationEntityLoader(from(liveQuery(() => {
            return dbTable.where('id').equals(store.configurationEntityId() ?? -1).first();
          })));
        });
      },
    })),
    // ? TODO: Should these be used?
    withComputed(({ entityMap, primaryEntityId, configurationEntityId }) => ({
      // primaryEntity: computed(() => {
      //   const selectedId = primaryEntityId();
      //   return selectedId ? entityMap()[selectedId] : null;
      // }),
      selectedPrimaryEntity: computed(() => {
        const selectedId = primaryEntityId();
        return selectedId ? entityMap()[selectedId] : null;
      }),
      selectedConfigurationEntity: computed(() => {
        const selectedId = configurationEntityId();
        return selectedId ? entityMap()[selectedId] : null;
      }),
    })),
  );
}
