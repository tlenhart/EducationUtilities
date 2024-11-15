import { Routes } from '@angular/router';

export const schedulerRoutes: Routes = [
  {
    path: 'scheduler',
    title: 'Scheduler',
    data: {
      icon: 'edit_calendar',
    },
    loadComponent: () => import('./scheduler-base.component').then(m =>
      m.SchedulerBaseComponent),
    loadChildren: () => import('./scheduling-panes.routes').then(m =>
      m.schedulingPanesRoutes),
  },
];
