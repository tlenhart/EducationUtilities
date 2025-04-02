import { computed, effect, inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalStore,
  signalStoreFeature,
  type,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import {
  addEntity,
  entityConfig,
  removeEntity,
  setAllEntities,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { DexieError, liveQuery } from 'dexie';
import { from, pipe } from 'rxjs';
import { Temporal } from 'temporal-polyfill';
import { eduUtilsDb } from '../../core/db/edu-utils.db';
import { DexieResult, DexieResult2 } from '../../models/dexie-result.model';
import {
  DbObservationSession,
  fromDbObservationSession,
  ObservationBehavior,
  ObservationEntry,
  ObservationEntryId,
  ObservationSession,
  ObservationSessionId,
  toInsertDbObservationSession,
  toObservationEntries,
} from '../../models/observation.model';
import { TimeInterval } from '../../models/time.model';
import { InsertDbType } from '../../scheduler-base/models/db.types';
import { PersonId } from '../../scheduler-base/models/person-type.model';
import { setLoading, withLoadingStatus } from './features/loading-status.store.feature';
import { withEntitiesTypeWithConfig, withStateType } from './features/with-entities-type.store.feature';
import { ObservationBehaviorStore } from './observation-behavior.store';
import { ObservationEntriesStore } from './observation-entries.store';
import { StudentStore } from './student.store';

export interface CurrentObservationSessionState {
  isOpen: boolean;
  currentObservation: Required<ObservationSession>;
}

const initialState: CurrentObservationSessionState = {
  isOpen: false,
  // isLoading: false,
  currentObservation: {
    id: 0,
    personId: 0, // TODO: See if this gets updated in the session.
    createdDate: Temporal.Now.zonedDateTimeISO(),
    startTime: Temporal.Now.zonedDateTimeISO(),
    showComparisonStudent: true,
    endTime: undefined,
    notes: '',
    comparisonStudentNotes: '',
    definedInitialSessionLength: undefined,
  },
};

const sessionEntryEntityConfig = entityConfig({
  entity: type<ObservationEntry>(),
  collection: 'observationEntries',
});

export const CurrentObservationSessionStore = signalStore(
  withState<CurrentObservationSessionState>(initialState),
  // withPartialBackgroundSaveToDb
  withEntities(sessionEntryEntityConfig),
  withProps((store) => ({
    _currentObservationLoader: rxMethod<DbObservationSession | null | undefined>(
      pipe(
        tapResponse({
          // TODO: Make sure this doesn't trigger too much.
          next: (foundEntity) => {
            if (!foundEntity) {
              return;
            }

            patchState(store, { currentObservation: { ...fromDbObservationSession(foundEntity) } });
          },
          error: console.error,
        }),
      ),
    ),
  })),
  withHooks((store) => ({
    onInit(): void {
      // TODO: If this is working right, this, along with the rxMethod should allow database changes to be automatically propagated to the primary identity.
      effect(() => {
        const currentObservationId = store.currentObservation.id();

        store._currentObservationLoader(from(liveQuery(() => {
          return eduUtilsDb.observationSessions.get(currentObservationId);
        })));
      });
    },
  })),
  withManageObservationSessionLifetime(),
  withManageBehaviorEntries(),
  withManageNotes(),
  withComputed((store, studentStore = inject(StudentStore)) => ({
    currentStudent: computed(() => {
      return studentStore.entityMap()[store.currentObservation.personId()];
    }),
    primaryStudentObservationEntries: computed(() => {
      const entries = store.observationEntriesEntities();

      return entries.filter((entry) => !entry.isComparisonStudent);
    }),
    comparisonStudentObservationEntries: computed(() => {
      const entries = store.observationEntriesEntities();

      return entries.filter((entry) => entry.isComparisonStudent);
    }),
  })),
  withComputed((store, behaviorStore = inject(ObservationBehaviorStore)) => ({
    currentStudentSortedBehaviors: computed(() => {
      const student = store.currentStudent();
      const behaviors = behaviorStore.sortedBehaviors();
      const studentBehaviors = student.behaviors ?? [];

      const response: Array<ObservationBehavior> = [];
      for (const behavior of behaviors) {
        if (studentBehaviors.includes(behavior.id)) {
          response.push(behavior);
        }
      }

      return response;
    }),
  })),
  withObservationSessionSettings(),
);

function withManageObservationSessionLifetime() {
  return signalStoreFeature(
    withLoadingStatus(),
    withStateType<CurrentObservationSessionState>(),
    withEntitiesTypeWithConfig<ObservationEntry, typeof sessionEntryEntityConfig.collection>(),
    withMethods((store, studentStore = inject(StudentStore)) => ({
      async initializeObservationSession(personId: PersonId, definedInitialSessionLength?: TimeInterval): Promise<DexieResult<ObservationSessionId>> {
        const newObservationSession: InsertDbType<ObservationSession> = {
          personId,
          definedInitialSessionLength: definedInitialSessionLength,
          createdDate: Temporal.Now.zonedDateTimeISO(),
          endTime: undefined,
          notes: undefined,
          comparisonStudentNotes: undefined,
          showComparisonStudent: true,
          startTime: undefined,
        };

        try {
          const sessionId = await eduUtilsDb.observationSessions.put(toInsertDbObservationSession(newObservationSession));

          return { result: sessionId, error: undefined } as DexieResult<ObservationSessionId>;
        } catch (e: unknown) {
          return { result: -1, error: e as DexieError };
        }
      },

      async openObservationSession(observationSessionId: ObservationSessionId): Promise<boolean> {
        patchState(store, setLoading(true));

        const observationSession = await eduUtilsDb.observationSessions.get(observationSessionId);

        if (!observationSession) {
          patchState(store, setLoading(false));
          return false;
        }

        const setStudentSuccess = studentStore.setPrimaryEntity(observationSession.personId);

        // We can't use studentStore.primaryEntity() here as it may not have loaded yet from the database
        //   Just make sure it exists.
        const student = studentStore.selectedPrimaryEntity();

        if (!setStudentSuccess || !student || student.id !== observationSession.personId) {
          console.warn('no student', student?.id, observationSession.personId);
          patchState(store, setLoading(false));
          return false;
        }

        const observationSessionEntries = await eduUtilsDb.observationEntries.where({ observationSessionId: observationSessionId }).toArray();

        patchState(store, {
          currentObservation: fromDbObservationSession(observationSession),
        } as Partial<CurrentObservationSessionState>);

        patchState(store, setAllEntities(toObservationEntries(observationSessionEntries), sessionEntryEntityConfig));

        patchState(store, setLoading(false));
        return true;
      },

      async clearSessionStart(): Promise<void> {
        const result = await eduUtilsDb.observationSessions.update(store.currentObservation.id(), { startTime: undefined });

        patchState(store, (state) => ({
          isOpen: true,
          currentObservation: {
            ...state.currentObservation,
            startTime: undefined,
          },
        }));
      },

      async startObservationSession(): Promise<DexieResult<boolean>> {
        const startTime: Temporal.ZonedDateTime = Temporal.Now.zonedDateTimeISO();

        // TODO: Might want to do this differently so it works across separate tabs.

        const result = await eduUtilsDb.observationSessions.update(store.currentObservation.id(), { startTime: startTime.toString() });

        if (result <= 0) {
          return { result: false, error: { message: 'Unable to start the session.' } as DexieError };
        }

        patchState(store, (state) => ({
          isOpen: true,
          currentObservation: {
            ...state.currentObservation,
            startTime: startTime,
          },
        }));

        return { result: true };
      },

      async resumeObservationSession(): Promise<DexieResult2<boolean>> {
        const result = await eduUtilsDb.observationSessions.update(store.currentObservation.id(), { endTime: undefined });

        if (result <= 0) {
          return DexieResult2.fromErrorMessage(false, 'Unable to resume the session.');
        }

        patchState(store, (state) => ({
          isOpen: false,
          currentObservation: {
            ...state.currentObservation,
            endTime: undefined,
          },
        }));

        return { result: true };
      },

      async endObservationSession(): Promise<DexieResult2<boolean>> {
        const endTime = Temporal.Now.zonedDateTimeISO();

        const result = await eduUtilsDb.observationSessions.update(store.currentObservation.id(), { endTime: endTime.toString() });

        if (result <= 0) {
          return DexieResult2.fromErrorMessage(false, 'Unable to end the session.');
        }

        patchState(store, (state) => ({
          isOpen: false,
          currentObservation: {
            ...state.currentObservation,
            endTime: endTime,
          },
        }));

        return { result: true };
      },
    })),
  );
}

function withManageBehaviorEntries() {
  return signalStoreFeature(
    withEntitiesTypeWithConfig<ObservationEntry, typeof sessionEntryEntityConfig.collection>(),
    withMethods((store, observationEntriesStore = inject(ObservationEntriesStore)) => ({

      async addBehaviorEntry(behaviorEntry: InsertDbType<ObservationEntry>): Promise<boolean> {
        const addResult: DexieResult2<ObservationEntryId, DexieError> = await observationEntriesStore.addBehaviorEntry(behaviorEntry);

        if (addResult.result < 1 || addResult.error) {
          return false;
        }

        const newObservationEntry: ObservationEntry = {
          ...behaviorEntry,
          id: addResult.result,
        };

        patchState(store, addEntity(newObservationEntry, sessionEntryEntityConfig));

        return true;
      },

      async removeBehaviorEntry(behaviorEntryId: ObservationEntryId): Promise<DexieResult2<boolean>> {
        const removeResult = await observationEntriesStore.removeBehaviorEntry(behaviorEntryId);

        if (!removeResult.result || removeResult.error) {
          return removeResult;
        }

        patchState(store, removeEntity(behaviorEntryId, sessionEntryEntityConfig));

        return removeResult;
      },

      async updateBehaviorEntryNote(observationEntryId: ObservationEntryId, note: string): Promise<boolean> {
        const numUpdated = await eduUtilsDb.observationSessions.update(observationEntryId, { notes: note });

        if (numUpdated !== 1) {
          return false;
        }

        const behaviorEntries = store.observationEntriesEntities();
        const behaviorEntryIndex = behaviorEntries.findIndex((entry) => entry.id === observationEntryId);
        const behaviorEntry: ObservationEntry = behaviorEntries[behaviorEntryIndex];

        if (behaviorEntryIndex > -1) {
          behaviorEntry.notes = note;

          patchState(store, updateEntity({
            id: observationEntryId,
            changes: { notes: note },
          }, sessionEntryEntityConfig));

          return true;
        } else {
          console.warn('Unable to update not found behavior entry');

          return false;
        }
      },
    })),
  );
}

function withManageNotes() {
  return signalStoreFeature(
    withStateType<CurrentObservationSessionState>(),
    withMethods((store) => ({
      async updateSessionNotes(noteContent: string, isPrimary: boolean): Promise<DexieResult2<boolean>> {
        // TODO: Might want to do this differently so it works across separate tabs.

        const updateData: Partial<Pick<DbObservationSession, 'notes' | 'comparisonStudentNotes'>> = {};

        if (isPrimary) {
          updateData.notes = noteContent;
        } else {
          updateData.comparisonStudentNotes = noteContent;
        }

        const result = await eduUtilsDb.observationSessions.update(
          store.currentObservation.id(),
          updateData
        );

        if (result <= 0) {
          return DexieResult2.fromErrorMessage(false, `Unable to update note content. isPrimary: ${isPrimary}`);
        }

        return DexieResult2.fromResult(true);
      },
    })),
  );
}

function withObservationSessionSettings() {
  return signalStoreFeature(
    withStateType<CurrentObservationSessionState>(),
    withMethods((store) => ({
      async showHideComparisonStudent(showHide: boolean): Promise<void> {
        // TODO: This doesn't handle database update errors.
        const result = await eduUtilsDb.observationSessions.update(
          store.currentObservation.id(),
          { showComparisonStudent: showHide },
        );

        patchState(store, (state) => ({
          currentObservation: {
            ...state.currentObservation,
            showComparisonStudent: showHide,
          },
        }));
      },
    })),
  );
}
