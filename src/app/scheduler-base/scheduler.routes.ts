import { Routes } from '@angular/router';
import { AidStore } from './stores/aid.store';
import { ScheduleStore } from './stores/schedule.store';
import { TeacherStore } from './stores/teacher.store';

export const schedulerRoutes: Routes = [
  {
    path: 'scheduler',
    title: 'Scheduler',
    data: {
      icon: 'edit_calendar',
    },
    providers: [
      ScheduleStore,
      TeacherStore,
      AidStore,
      // StudentStore,
    ],
    // loadComponent: () => import('./scheduler-base.component').then(m =>
    //   m.SchedulerBaseComponent),
    // loadChildren: () => import('./scheduling-panes.routes').then(m =>
    //   m.schedulingPanesRoutes),
    loadChildren: () => import('./scheduler-base.routes').then(m =>
      m.scheduleBaseRoutes),
    // children: [
    //   {
    //     path: 'schedule',
    //     title: 'Schedule',
    //     data: {
    //       icon: 'edit_calendar',
    //     },
    //     loadComponent: () => import('./scheduler-base.component').then(m =>
    //       m.SchedulerBaseComponent),
    //     loadChildren: () => import('./scheduling-panes.routes').then(m =>
    //       m.schedulingPanesRoutes),
    //   },
    //   {
    //     path: 'dashboard',
    //     title: 'Schedule',
    //     data: {
    //       icon: 'edit_calendar',
    //     },
    //     // loadComponent
    //   },
    // ]
  },
];
