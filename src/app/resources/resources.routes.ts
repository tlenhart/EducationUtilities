import { Routes } from '@angular/router';

export const resourcesRoutes: Routes = [
  {
    path: 'privacy',
    title: 'Privacy',
    loadComponent: () => import('./privacy/privacy.component').then(m =>
      m.PrivacyComponent),
  },
];
