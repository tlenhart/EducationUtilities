import { UnrecoverableStateEvent, VersionEvent } from '@angular/service-worker';

export interface AppVersion {
  packageJsonVersion: string;
  gitVersion: string;
  buildDate: string;
}

export interface AngularHashVersion {
  currentAngularHash: string;
  latestAngularHash: string;
  swEventState: 'unloaded' | VersionEvent['type'] | UnrecoverableStateEvent['type'];
  swIsEnabled: boolean;
  errorMessage?: string;
}

export interface FullVersionInfo {
  appVersion: AppVersion;
  angularVersion: AngularHashVersion;
  userAgent: string;
}

export type DbVersion = Readonly<Record<string, number>>;

// ! Update this whenever a database version changes.
// ! NOTE: These are not currently retrieved from the databases themselves to avoid loading the databases when unnecessary.
export const dbVersions: Readonly<Record<'scheduler' | 'settings' | 'eduUtils' | 'audio' | 'logs', DbVersion>> = {
  scheduler: {
    current: 4,
    // currentDbVersion: schedulerDb.verno,
    // previous: [1, 2, 3],
  },
  settings: {
    current: 1,
    // currentDbVersion: settings.verno,
    // previous: [1, 2, 3]
  },
  eduUtils: {
    one: 1,
    two: 2,
    three: 3,
    // currentDbVersion: settings.verno,
    // previous: [1, 2, 3]
  },
  audio: {
    one: 1,
  },
  logs: {
    two: 2,
    // previous: [1],
  },
};
