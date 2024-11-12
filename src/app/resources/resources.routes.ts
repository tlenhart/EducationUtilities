import { Routes } from '@angular/router';

export const numbersRoutes: Routes = [
  {
    path: 'privacy',
    title: 'Privacy',
    loadComponent: () => import('./privacy/privacy.component').then(m =>
      m.PrivacyComponent),
  },
];
