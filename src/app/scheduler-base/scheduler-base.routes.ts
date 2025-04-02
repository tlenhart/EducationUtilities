import { Routes } from '@angular/router';
import { scheduleIdResolver } from './schedule-id.resolver';

export const scheduleBaseRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: 'dashboard',
    title: 'Schedule Dashboard',
    data: {
      icon: 'edit_calendar',
    },
    loadComponent: () => import('./schedule-dashboard/schedule-dashboard.component').then(m =>
      m.ScheduleDashboardComponent),
  },
  {
    path: 'schedule/:id',
    title: 'Schedule ...',
    data: {
      icon: 'edit_calendar',
    },
    resolve: [
      scheduleIdResolver,
    ],
    loadComponent: () => import('./scheduler-base.component').then(m =>
      m.SchedulerBaseComponent),
    loadChildren: () => import('./scheduling-panes.routes').then(m =>
      m.schedulingPanesRoutes),
  }
];
