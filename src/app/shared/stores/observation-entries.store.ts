import { signalStore, withMethods } from '@ngrx/signals';
import { DexieError } from 'dexie';
import { eduUtilsDb } from '../../core/db/edu-utils.db';
import { DexieResult2 } from '../../models/dexie-result.model';
import { ObservationEntry, ObservationEntryId, toInsertDbObservationEntry } from '../../models/observation.model';
import { InsertDbType } from '../../scheduler-base/models/db.types';

/**
 * Store for managing observation session entries.
 *
 * This store should be used to manage all entries, and not be used to hold specific observation session data.
 */
export const ObservationEntriesStore = signalStore(
  withMethods((store) => ({
    async addBehaviorEntry(behaviorEntry: InsertDbType<ObservationEntry>): Promise<DexieResult2<ObservationEntryId>> {
      try {
        const behaviorObservationEntryId = await eduUtilsDb.observationEntries.put(
          toInsertDbObservationEntry(behaviorEntry),
        );

        return DexieResult2.fromResult(behaviorObservationEntryId);
      } catch (e: unknown) {
        return DexieResult2.buildDexieResult(0, e);
      }
    },
    async removeBehaviorEntry(behaviorEntryId: ObservationEntryId): Promise<DexieResult2<boolean>> {
      try {
        // TODO: Ensure this is what happens when a delete fails. (An exception is thrown.)
        // When called directly, this may not update the current observation session. (As it may not be loading changes from the database and instead relying on the store's state for data.
        await eduUtilsDb.observationEntries.delete(behaviorEntryId);
        return new DexieResult2(true);
      } catch (e: unknown) {
        return DexieResult2.buildDexieResultFromDexieError(false, e as DexieError);
      }
    },
  })),
);
