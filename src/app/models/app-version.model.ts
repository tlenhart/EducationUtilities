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
