import { Routes } from '@angular/router';

/**
 * Route(s) for setting settings.
 */
export const settingsRoutes: Routes = [
  {
    path: 'settings',
    loadComponent: () => import('./settings.component').then(m =>
      m.SettingsComponent),
  },
];
