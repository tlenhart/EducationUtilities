import { Routes } from '@angular/router';

export const numbersRoutes: Routes = [
  {
    path: 'numbers-table',
    loadComponent: () => import('./numbers-table/numbers-table.component').then(m =>
      m.NumbersTableComponent),
  }
];
