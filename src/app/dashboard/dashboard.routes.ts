import { Routes } from '@angular/router';

const mainPath: string = 'dashboard';

export const mainDashboardRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: mainPath,
  },
  {
    path: mainPath,
    loadComponent: () => import('./dashboard.component').then(m =>
      m.DashboardComponent),
  },
];

// ! This should be imported at the end of app.routes.ts.
export const fallbackRoute: Routes = [
  {
    path: '**',
    redirectTo: mainPath,
  }
]
