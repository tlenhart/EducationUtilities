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
  withProps,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { from, of, pipe, switchMap, take, tap, throwError } from 'rxjs';
import { Intl as TemporalIntl, Temporal } from 'temporal-polyfill';
import { getDaysOfWeek, TemporalDayOfWeek } from '../scheduler-base/models/schedule-time.model';
import {
  setLoadedFromDb,
  ValuesLoadedFromDb,
  withHasLoadedFromDb,
} from '../shared/stores/features/loaded-from-db.store.feature';
import { generateTemporalRange } from '../utils/time.utils';
import { settingsDb } from './settings.db';
import {
  DateTimeDisplaySettings,
  DisplaySettings,
  NewGlobalSettings,
  ScheduleDateSettings,
  ScheduleTimeSettings,
} from './settings.model';

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
  feedbackSettings: {
    showSecret: false,
    enabled: true,
    secret: '',
  },
  displaySettings: {
    dateTimeFormat: {},
    useDetailedDateTimeFormatting: false,
    dateOnlyFormat: {
      enabled: false,
      useDetailedFormatting: false,
      format: {},
    },
    timeOnlyFormat: {
      enabled: false,
      useDetailedFormatting: false,
      format: {},
    },
  },
  frequencyDataSettings: {
    enableHapticFeedback: false,
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
    },
    enableDisableFeedback(enabled: boolean): void {
      patchState(store, (state) => ({
        feedbackSettings: {
          ...state.feedbackSettings,
          enabled: enabled,
        },
      }));
    },
    updateSecret(secret: string): void {
      // Storing and updating the secret this way isn't the most secure, but the secret does stay local to the device,
      //  and the scope of current users is 1
      patchState(store, (state) => ({
        feedbackSettings: {
          ...state.feedbackSettings,
          secret: secret,
        },
      }));
    },
    showHideFeedbackSecret(show: boolean): void {
      patchState(store, (state) => ({
        feedbackSettings: {
          ...state.feedbackSettings,
          showSecret: show,
        },
      }));
    },
    updateDisplaySettings(displaySettings: DisplaySettings): void {
      patchState(store, (state) => ({
        displaySettings: {
          ...state.displaySettings,
          ...displaySettings,
        },
      }));
    },
    updateDateTimeFormatSettings(dateTimeFormatOptions: Intl.DateTimeFormatOptions): void {
      patchState(store, (state) => ({
        displaySettings: {
          ...state.displaySettings,
          dateTimeFormat: {
            ...state.displaySettings.dateTimeFormat,
            ...dateTimeFormatOptions,
          },
        },
      }));
    },
    toggleFrequencyDataHapticFeedback(): void {
      patchState(store, (state) => ({
        frequencyDataSettings: {
          ...state.frequencyDataSettings,
          enableHapticFeedback: !state.frequencyDataSettings.enableHapticFeedback,
        },
      }));
    },
  })),
  // withComputed(({ schedulerSettings }) => ({
  //   schedulerDayStart: computed(() => Temporal.PlainTime.from(schedulerSettings.time.dayStart())),
  //   schedulerDayEnd: computed(() => Temporal.PlainTime.from(schedulerSettings.time.dayEnd())),
  // })),
  withComputed(({ schedulerSettings }) => ({
    calendarDays: computed(() => getDaysOfWeek(schedulerSettings.date.excludeDays(), schedulerSettings.date.weekStart())),
  })),
  withProps((store) => ({
    _intlResolvedOptions: Intl.NumberFormat().resolvedOptions(),
  })),
  withComputed(({ displaySettings, _intlResolvedOptions }) => ({
    dateTimeFormatter: computed(() => {
      // TODO: Make sure this doesn't fire when other display settings are changed.
      const settings = displaySettings.dateTimeFormat();

      // return new Intl.DateTimeFormat(undefined, settings);
      return new TemporalIntl.DateTimeFormat(_intlResolvedOptions.locale, settings);
    }),
  })),
  withComputed(({ displaySettings, _intlResolvedOptions }) => ({
    dateOnlyFormatter: computed((): Intl.DateTimeFormat => {
      const defaultFormat = displaySettings.dateTimeFormat();
      const dateOnlyFormat: DateTimeDisplaySettings | null = displaySettings.dateOnlyFormat();

      if (!dateOnlyFormat) {
        const format: Intl.DateTimeFormatOptions = {
          ...defaultFormat,
          timeStyle: undefined,
        };

        // return new Intl.DateTimeFormat(_intlResolvedOptions.locale, format);
        return new TemporalIntl.DateTimeFormat(_intlResolvedOptions.locale, format);
      }

      // return new Intl.DateTimeFormat(_intlResolvedOptions.locale, dateOnlyFormat.format);
      return new TemporalIntl.DateTimeFormat(_intlResolvedOptions.locale, dateOnlyFormat.format);
    }),
    timeOnlyFormatter: computed((): Intl.DateTimeFormat => {
      const defaultFormat = displaySettings.dateTimeFormat();
      const timeOnlyFormat: DateTimeDisplaySettings | null = displaySettings.timeOnlyFormat();

      if (!timeOnlyFormat) {
        const format: Intl.DateTimeFormatOptions = {
          ...defaultFormat,
          dateStyle: undefined,
        };

        // return new Intl.DateTimeFormat(_intlResolvedOptions.locale, format);
        return new TemporalIntl.DateTimeFormat(_intlResolvedOptions.locale, format);
      }

      // return new Intl.DateTimeFormat(_intlResolvedOptions.locale, timeOnlyFormat.format);
      return new TemporalIntl.DateTimeFormat(_intlResolvedOptions.locale, timeOnlyFormat.format);
    }),
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
                    // settingsDb.close(); // TODO: Re-enable if you start using the background worker.

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

function withSaveToDatabase() {
  return signalStoreFeature(
    withState<Partial<NewGlobalSettings> & Partial<ValuesLoadedFromDb>>({}),
    // withProps((store) => ({
    //   _settingsDbWorker: typeof Worker !== 'undefined'
    //     ? new Worker(new URL('./settings.db.worker', import.meta.url), { type: 'module' })
    //     : null,
    // } as { _settingsDbWorker: Worker | null })),
    withMethods((store) => ({
      async exportSettings(): Promise<void> {
        // store._settingsDbWorker?.postMessage({ eventType: 'export' });
        const result = await settingsDb.exportDb();
        console.warn('result', result);
      },
    })),
    withHooks({
      onInit(store) {
        effect(() => {
          // if (store)
          const state = getState(store);

          if (Object.hasOwn(state, 'hasLoaded') && (state as ValuesLoadedFromDb).hasLoaded) {
            // console.warn('updating in db.');

            void (async () => {
              await settingsDb.settings.update('user', { ...state });
            })();

            // if (store._settingsDbWorker) {
            //   store._settingsDbWorker.postMessage({ eventType: 'update', settings: state });
            // } else {
            //   // TODO: Test.
            //   // void (async () => {
            //   //   await settingsDb.settings.update('user', state);
            //   // })();
            // }
          }
        });
      },
      // onDestroy(store) {
      //   if (store._settingsDbWorker) {
      //     console.log('destroying worker');
      //     // TODO: Consider sending a signal to the worker to terminate itself so the db reference can be closed and the subscription cleaned up.
      //     //    Assuming this code is ever called at all.
      //     //    Which it might not be because the settings store is global.
      //     store._settingsDbWorker.terminate();
      //   }
      // },
    }),
  );
}
