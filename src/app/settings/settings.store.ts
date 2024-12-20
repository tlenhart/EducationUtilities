import { computed, effect } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import {
  getState,
  patchState,
  signalStore,
  signalStoreFeature,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import Dexie from 'dexie';
import { from, of, pipe, switchMap, take, tap, throwError } from 'rxjs';
import { Temporal } from 'temporal-polyfill';
import { getDaysOfWeek, TemporalDayOfWeek } from '../scheduler-base/models/schedule-time.model';
import {
  setLoadedFromDb,
  ValuesLoadedFromDb,
  withHasLoadedFromDb,
} from '../shared/stores/features/loaded-from-db.store.feature';
import { generateTemporalRange } from '../utils/time.utils';
import { settingsDb } from './settings.db';
import { NewGlobalSettings, ScheduleDateSettings, ScheduleTimeSettings } from './settings.model';

export const globalUserSettingsDefaults: Readonly<NewGlobalSettings> = {
  name: 'user',
  schedulerSettings: {
    time: {
      timePickerInterval: '30m',
      dayStart: '08:00',
      dayEnd: '17:00',
    },
    date: {
      weekStart: TemporalDayOfWeek.Monday,
      excludeDays: [TemporalDayOfWeek.Saturday, TemporalDayOfWeek.Sunday],
    },
    calendar: {
      defaultCalendarTimeInterval: '30m',
      dayStart: '07:00',
      dayEnd: '17:00',
    },
    panelSplitPercentage: 0.50,
  },
};

// export type NewGlobalSettings_Defaults = NewGlobalSettings;

export const SettingsStore = signalStore(
  { providedIn: 'root' },
  withState<NewGlobalSettings>(globalUserSettingsDefaults),

  withHasLoadedFromDb(),
  withLoadFromDb(),
  withSaveToDatabase(), // TODO: Make sure setting the default doesn't override anything in the database!

  withMethods((store) => ({
    addSetting(setting: NewGlobalSettings): void {
      patchState(store, setting);
    },
    updateSetting(setting: NewGlobalSettings): void {
      patchState(store, setting);
    },
    updateTimeSettings(scheduleTimeSettings: Partial<ScheduleTimeSettings>): void {
      patchState(store, (state) => ({
        schedulerSettings: {
          ...state.schedulerSettings,
          time: {
            ...state.schedulerSettings.time,
            ...scheduleTimeSettings,
          },
        },
      }));
    },
    updateDateSettings(scheduleDateSettings: Partial<ScheduleDateSettings>): void {
      patchState(store, (state) => ({
        schedulerSettings: {
          ...state.schedulerSettings,
          date: {
            ...state.schedulerSettings.date,
            ...scheduleDateSettings,
            excludeDays: [...scheduleDateSettings.excludeDays ?? []],
          },
        },
      }));
    },
    updateSchedulerPanelSplitPercent(percent: number): void {
      patchState(store, (state) => ({
        schedulerSettings: {
          ...state.schedulerSettings,
          panelSplitPercentage: percent,
        },
      }));
    }
  })),
  // withComputed(({ schedulerSettings }) => ({
  //   schedulerDayStart: computed(() => Temporal.PlainTime.from(schedulerSettings.time.dayStart())),
  //   schedulerDayEnd: computed(() => Temporal.PlainTime.from(schedulerSettings.time.dayEnd())),
  // })),
  withComputed(({ schedulerSettings }) => ({
    calendarDays: computed(() => getDaysOfWeek(schedulerSettings.date.excludeDays(), schedulerSettings.date.weekStart())),
  })),
  withComputed(({ schedulerSettings }) => ({
    calendarDayIntervals: computed(() => Array.from(generateTemporalRange(
      schedulerSettings.calendar.dayStart(),
      schedulerSettings.calendar.dayEnd(),
      schedulerSettings.calendar.defaultCalendarTimeInterval(),
    )) as ReadonlyArray<Temporal.PlainTime>),
  })),
);

function withLoadFromDb() {
  return signalStoreFeature(
    withMethods((store) => ({
      // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
      loadSettings: rxMethod<void>(
        pipe(
          tap(() => {
            patchState(store, setLoadedFromDb(false));
          }),
          switchMap(() => {
            return from(settingsDb.settings.get('user'))
              .pipe(
                take(1),
                switchMap((settings?: NewGlobalSettings) => {
                  if (settings) {
                    return of(settings);
                  }

                  // TODO: Try moving this to the worker.
                  return from(settingsDb.settings.bulkPut([
                    {
                      ...globalUserSettingsDefaults,
                      name: 'default',
                    },
                    {
                      ...globalUserSettingsDefaults,
                      name: 'user',
                    },
                  ], {
                    allKeys: true,
                  })).pipe(switchMap((addedKeys: Array<'user' | 'default'>) => {
                    if (addedKeys.length > 0) {
                      return from(settingsDb.settings.get('user'));
                    } else {
                      return throwError(() => new Error('Unable to get/save default settings.'));
                    }
                  }));
                }),
                tapResponse({
                  next: (settings?: NewGlobalSettings) => {
                    // ? Keep?
                    settingsDb.close();

                    if (settings) {
                      patchState(store, settings);
                    } else {
                      throw new Error('Settings were not found!!!');
                    }

                    patchState(store, setLoadedFromDb(true));
                  },
                  error: (error: unknown) => {
                    console.error('error loading user settings from db', error);
                    patchState(store, setLoadedFromDb(false)); // TODO: Error state instead?
                  },
                  finalize: () => {
                    console.log('finalizing loading user settings');
                    // patchState(store, setLoading(false));
                  },
                }),
              );
          }),
        ),
      ),
    })),
  );
}

let settingsDbWorker: Worker | null; // TODO: Maybe pass this into the storeFeature? (And other settings like script path so this can be used elsewhere.)
function withSaveToDatabase(db?: Dexie) {
  return signalStoreFeature(
    withState<Partial<NewGlobalSettings> & Partial<ValuesLoadedFromDb>>({}),
    withMethods((state) => ({
      exportSettings(): void {
        settingsDbWorker?.postMessage({ eventType: 'export' });
      },
    })),
    withHooks({
      // TODO: Get better typing here.
      onInit(store) {
        // TODO: Store in state instead?

        if (typeof Worker !== 'undefined') {
          settingsDbWorker = new Worker(new URL('./settings.db.worker', import.meta.url), { type: 'module' });
          // settingsDbWorker.onmessage = ({ data }: MessageEvent<string>) => {
          //   // this.updateTableValues.emit(data);
          //   console.warn('db worker response', data);
          // };
        } else {
          // Web Workers are not supported in this environment.
          // this.useWorkerFallback = true;
          settingsDbWorker = null;
        }

        effect(() => {
          // if (store)
          const state = getState(store);

          if (Object.hasOwn(state, 'hasLoaded') && (state as ValuesLoadedFromDb).hasLoaded) {
            // console.warn('updating in db.');

            if (settingsDbWorker) {
              settingsDbWorker.postMessage({ eventType: 'update', settings: state });
            } else {
              // TODO: Test.
              // void (async () => {
              //   await settingsDb.settings.update('user', state);
              // })();
            }
          }
        });
      },
      onDestroy(store) {
        if (settingsDbWorker) {
          console.log('destroying worker');
          // TODO: Consider sending a signal to the worker to terminate itself so the db reference can be closed and the subscription cleaned up.
          //    Assuming this code is ever called at all.
          //    Which it might not be because the settings store is global.
          settingsDbWorker.terminate();
        }
      },
    }),
  );
}
