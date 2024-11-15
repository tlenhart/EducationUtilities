import { Routes } from '@angular/router';

export const scheduleEditorsRoutes: Routes = [
  {
    path: '',
    redirectTo: 'schedule-builder',
    pathMatch: 'full',
  },
  {
    path: 'schedule-builder',
    title: 'Scheduler Builder',
    data: {
      icon: 'edit_calendar',
    },
    loadComponent: () => import('./schedule-builder/schedule-builder.component').then(m =>
      m.ScheduleBuilderComponent),
  }
];
