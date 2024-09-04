import { Routes } from '@angular/router';
import { fallbackRoute, mainDashboardRoutes } from './dashboard/dashboard.routes';
import { numbersRoutes } from './numbers/numbers.routes';
import { settingsRoutes } from './settings/settings.routes';
import { numbersRoutes } from "./numbers/numbers.routes";

export const routes: Routes = [
  ...mainDashboardRoutes,
  ...numbersRoutes,
  ...settingsRoutes,
  ...fallbackRoute,
];
