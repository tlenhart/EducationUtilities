import { computed } from '@angular/core';
import { patchState, signalStore, type, withComputed, withMethods } from '@ngrx/signals';
import { addEntity, entityConfig, removeEntity, updateEntity, withEntities } from '@ngrx/signals/entities';
import { DexieError, liveQuery } from 'dexie';
import { from } from 'rxjs';
import { eduUtilsDb } from '../../core/db/edu-utils.db';
import { UpdateSpecWithoutPropModification } from '../../models/db-event-type.model';
import { DexieResult } from '../../models/dexie-result.model';
import {
  BehaviorId,
  DbObservationBehavior,
  DbObservationBehaviorChanges,
  fromDbObservationBehaviors,
  ObservationBehavior,
  toDbObservationBehavior,
  toInsertDbObservationBehavior,
} from '../../models/observation.model';
import { InsertDbType } from '../../scheduler-base/models/db.types';
import { withAutomaticallyLoadEntities } from './features/schedule-id-changes.store.feature';
import { withSelectedEntity } from './features/selected-entity.store.feature';
import { withAutoReloadEntitiesFromDb } from './features/with-auto-reload-entities-from-db.store.feature';

const behaviorEntityConfig = entityConfig({
  entity: type<ObservationBehavior>(),
});

export const ObservationBehaviorStore = signalStore(
  { providedIn: 'root' },
  withEntities(behaviorEntityConfig),
  withSelectedEntity<ObservationBehavior>(),
  withAutomaticallyLoadEntities<ObservationBehavior, DbObservationBehavior, BehaviorId, DbObservationBehaviorChanges>(eduUtilsDb.observationBehaviors, fromDbObservationBehaviors),
  // withPartialBackgroundSaveToDb(new Worker(new URL('./observation-behavior.db.worker.ts', import.meta.url), { type: 'module' })),
  withMethods((store) => ({

    async addObservationBehavior(observationBehavior: InsertDbType<ObservationBehavior>): Promise<DexieResult<BehaviorId>> {
      const dbObservationBehavior: InsertDbType<ObservationBehavior> = toInsertDbObservationBehavior(observationBehavior);
      if (await eduUtilsDb.observationBehaviors.where('behavior').equalsIgnoreCase(dbObservationBehavior.behavior).first()) {
        return { result: -1, error: { name: 'ConstraintError' } as DexieError };
      }

      try {
        const id = await eduUtilsDb.observationBehaviors.put(dbObservationBehavior);

        const newBehavior: ObservationBehavior = {
          ...observationBehavior,
          id: id,
        };

        patchState(store, addEntity(newBehavior)); // TODO: Will this trigger a liveQuery and get everything reloaded?

        return { result: id };
      } catch (e: unknown) {
        console.error(`Dexie Error ${typeof e}`, e);

        return { result: -1, error: e as DexieError };
      }
    },

    async removeObservationBehavior(observationBehaviorId: BehaviorId): Promise<void> {
      // TODO: Handle errors here!
      // TODO: Test this transaction.
      try {
        // Run the query as a transaction to remove the observation behavior and remove it from any students that are assigned the behavior.
        const result = await eduUtilsDb.transaction('rw', [eduUtilsDb.observationBehaviors, eduUtilsDb.students], async () => {
          const observationDelete = eduUtilsDb.observationBehaviors.delete(observationBehaviorId);

          // TODO: Keep distinct()?
          // TODO: We are going to need to make sure the student is notified in the store when a behavior was deleted from them.
          const studentDelete = eduUtilsDb
            .students
            .where('behaviors') // MultiIndex key for all the behavior ids for the student.
            .equals(observationBehaviorId) // When the student has the behavior being removed.
            .distinct() // Distinct students.
            .modify((student) => {
              // TODO: Use set operations instead?
              const index = student.behaviors.indexOf(observationBehaviorId);

              if (index > -1) {
                student.behaviors.splice(index, 1);
                return true;
              } else {
                return false; // TODO: Determine if you want to do this.
              }
            });

          // ! TODO: Determine if this is the right way of doing this.
          return Promise.all([observationDelete, studentDelete]);
        });

        console.log('behavior delete result', result);

        patchState(store, removeEntity(observationBehaviorId));
      } catch (error: unknown) {
        console.error('error deleting behavior id', observationBehaviorId, error);
      }
    },

    async updateObservationBehavior(id: BehaviorId | null, changes: UpdateSpecWithoutPropModification<ObservationBehavior>): Promise<void> {
      if (id) {
        // TODO: Check for success? (Or perform rollback?)
        // TODO: Notify of errors.

        const dbObservationBehavior: UpdateSpecWithoutPropModification<DbObservationBehavior> = toDbObservationBehavior(id, changes);
        const entriesUpdated: number = await eduUtilsDb.observationBehaviors.update(id, { ...dbObservationBehavior });

        // Only patch the state when the database update succeeded.
        if (entriesUpdated === 1) {
          // TODO: Make sure notifications work for when behaviors are updated and students get the newest values.
          patchState(store, updateEntity({ id: id, changes: changes }));
        } else {
          console.error(`ObservationBehavior id: ${id} not found.`);
        }
      } else {
        throw new Error('An id is required to update the observation behavior.');
        // return Promise.reject(new Error('An id is required to update the observation behavior.'));
      }
    },

    // updateObservationBehaviorWithBackgroundWorker()
  })),
  withComputed((store) => ({
    // TODO: Determine if the first character should be sorted in the order, or if it should be capitals first and then lowercase.
    sortedBehaviors: computed(() => store.entities().sort((a, b) => a.behavior.toLocaleLowerCase() > b.behavior.toLocaleLowerCase() ? 1 : -1)),
    lowercaseEntityMap: computed(() => {
      const entityMap = store.entityMap();

      const result: ReturnType<typeof store.entityMap> = {};
      for (const entity of Object.values(entityMap)) {
        result[entity.id] = {
          ...entity,
          behavior: entity.behavior.toLocaleLowerCase(),
        };
      }

      return result;
    }),
  })),
  withComputed((store) => ({
    lowercaseEntityNames: computed(() => {
      const entities = store.sortedBehaviors();

      return new Set<Lowercase<string>>(entities.map((entity) => entity.behavior.toLocaleLowerCase()) as Array<Lowercase<string>>);
    }),
  })),
  withAutoReloadEntitiesFromDb<ObservationBehavior, DbObservationBehavior>(
    fromDbObservationBehaviors,
    from(liveQuery(() => eduUtilsDb.observationBehaviors.toArray())),
    'autoReloadObservationBehaviors',
  ),
);
