import { Routes } from '@angular/router';

export const frequencyReportingRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'reports',
  },
  {
    path: 'reports',
    title: 'Frequency Data Reports',
    data: {
      icon: 'monitoring',
    },
    providers: [],
    loadComponent: () => import('./frequency-reporting.component').then(m =>
      m.FrequencyReportingComponent),
  },
];
