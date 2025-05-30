import { Routes } from '@angular/router';
import { fallbackRoute, mainDashboardRoutes } from './dashboard/dashboard.routes';
import { notesRoutes } from './notes/notes.routes';
import { frequencyRoutes } from './frequency/frequency.routes';
import { numbersRoutes } from './numbers/numbers.routes';
import { schedulerRoutes } from './scheduler-base/scheduler.routes';
import { settingsRoutes } from './settings/settings.routes';

export const routes: Routes = [
  ...mainDashboardRoutes,
  ...numbersRoutes,
  ...schedulerRoutes,
  ...notesRoutes,
  ...frequencyRoutes,
  ...settingsRoutes,
  ...fallbackRoute,
];
