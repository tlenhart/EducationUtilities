import { Routes } from '@angular/router';

export const scheduleConfigurationRoutes: Routes = [
  {
    path: '',
    redirectTo: 'schedule-configuration',
    pathMatch: 'full',
  },
  {
    path: 'schedule-configuration',
    title: 'Schedule Configuration',
    data: {
      icon: 'edit_calendar',
    },
    loadComponent: () => import('./schedule-config-base/schedule-config-base.component').then(m =>
      m.ScheduleConfigBaseComponent),

    children: [
      {
        path: 'teachers',
        title: 'Teacher Configuration',
        data: {
          icon: 'edit_calendar',
        },
        loadComponent: () => import('./teacher-configuration/teacher-configuration.component').then(m =>
          m.TeacherConfigurationComponent),
      },
    ],
  },
];
