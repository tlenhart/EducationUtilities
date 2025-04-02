import { tapResponse } from '@ngrx/operators';
import { patchState, signalStoreFeature, withHooks, withMethods, withProps } from '@ngrx/signals';
import { EntityId, setAllEntities } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { Observable, pipe } from 'rxjs';

export function withAutoReloadEntitiesFromDb<TStoreEntity extends { id: EntityId }, TDbEntity>(
  convertDbEntitiesFn: (entities: Array<TDbEntity>) => Array<TStoreEntity>,
  fromDbLiveQuery: Observable<Array<TDbEntity>>,
  listenerName: string,
) {
  return signalStoreFeature(
    withMethods((store) => ({
      _autoLoadEntities: rxMethod<Array<TDbEntity>>(
        pipe(
          tapResponse({
            next: (entities: Array<TDbEntity>) => {
              patchState(store, setAllEntities(convertDbEntitiesFn(entities)));
            },
            error: (error: unknown) => {
              console.error('Error while loading or reloading entities.', error);
            },
            finalize: () => {
            },
          }),
        ),
      ),
    })),
    withProps((store) => ({
      [listenerName]: null,
    } as Record<typeof listenerName, ReturnType<typeof store._autoLoadEntities> | null>)), // { [listenerName]: ReturnType<typeof store.autoLoadEntities> | null })),
    withHooks((store) => ({
      onInit() {
        if (store[listenerName]) {
          throw new Error(`${listenerName} already exists as a db query listener or other property. Please change the listener name to something unique.`);
        }

        store[listenerName] = store._autoLoadEntities(fromDbLiveQuery);
      },
      onDestroy() {
        store[listenerName]?.destroy(); // TODO: Might not be necessary.
        store[listenerName] = null;
      },
    })),
  );
}
