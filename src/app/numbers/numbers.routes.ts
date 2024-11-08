import { Routes } from '@angular/router';

export const numbersRoutes: Routes = [
  {
    path: 'numbers-table',
    title: 'Numbers Table',
    loadComponent: () => import('./numbers-table/numbers-table.component').then(m =>
      m.NumbersTableComponent),
  },
  {
    path: 'multiplication-table',
    title: 'Multiplication Table',
    loadComponent: () => import('./multiplication-table/multiplication-table.component').then(m =>
      m.MultiplicationTableComponent),
  }
];
