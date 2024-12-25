import { Routes } from '@angular/router';

export const reportsRoutes: Routes = [
  {
    path: ':id',
    title: 'Schedule Reports', // May want to do dynamically for the id number.
    // TODO: Or at least automatically update the title with a resolver for the schedule id.
    data: {
      icon: 'edit_calendar',
    },
    // loadChildren: () => import('./reports.component').then(m =>
    //   m.ReportsComponent),
    loadComponent: () => import('./reports.component').then(m =>
      m.ReportsComponent),
  },
];
