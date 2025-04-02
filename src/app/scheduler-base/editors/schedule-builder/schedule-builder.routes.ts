import { Routes } from '@angular/router';

export const scheduleBuilderRoutes: Routes = [
  {
    path: 'schedule-builder',
    title: 'Schedule Builder',
    data: {
      icon: 'edit_calendar',
    },
    loadComponent: () => import('./schedule-builder.component').then(m =>
      m.ScheduleBuilderComponent),
  },
];
