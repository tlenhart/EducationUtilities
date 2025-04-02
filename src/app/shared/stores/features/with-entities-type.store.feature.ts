import { signalStoreFeature, type, withState } from '@ngrx/signals';
import { EntityId, withEntities } from '@ngrx/signals/entities';

export const entityType = type;

export function withEntitiesType<TStoreEntity extends { id: EntityId }>() {
  return signalStoreFeature(
    entityType<ReturnType<typeof withEntities<TStoreEntity>>>(),
  );
}

export function withEntitiesTypeWithConfig<TStoreEntity extends { id: EntityId }, TEntityCollection extends string>() {
  return signalStoreFeature(
    entityType<ReturnType<typeof withEntities<TStoreEntity, TEntityCollection>>>(),
  );
}

export function withStateType<TState extends object>() {
  return signalStoreFeature(
    entityType<ReturnType<typeof withState<TState>>>(),
  );
}
