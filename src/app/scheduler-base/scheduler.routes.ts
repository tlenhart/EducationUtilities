import { Routes } from '@angular/router';
import { ScheduleStore } from './stores/schedule.store';
import { TeacherStore } from './stores/teacher.store';

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
