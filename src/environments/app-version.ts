// ! If updating this file, make sure to also update the `update-app-version.ts` build script
//   with the updated contents.
// The actual build numbers will be replaced during build and replaced by the angular compiler.
//   The current values are placeholder dev values.
import { AppVersion } from '../app/models/app-version.model';

export const packageJsonVersion: string = '0.0.0';
export const gitVersion: string = 'git-version';
export const buildDate: string = '2024-12-26T19:34:36.190Z';

export const appVersion: AppVersion = { packageJsonVersion, gitVersion, buildDate };
