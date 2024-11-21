import { Routes } from '@angular/router';

export const teacherConfigurationRoutes: Routes = [
  {
    path: 'teachers',
    title: 'Teachers',
    data: {
      icon: 'edit_calendar',
    },
    loadComponent: () => import('./teacher-configuration.component').then(m =>
      m.TeacherConfigurationComponent),
    children: [
      {
        path: ':id',
        title: 'Teacher',
        loadComponent: () => import('./edit-teacher/edit-teacher.component').then(m =>
          m.EditTeacherComponent),
      },
    ],
  },
];
