import { Routes } from '@angular/router';
import { selectedStudentResolver } from '../../scheduler-base/resolvers/selected-student/selected-student.resolver';
import {
  observationBehaviorRouteParamKeys
} from './all-observation-behaviors-configuration/observation-behavior-configuration.routes';

export const observationStudentConfigRoutes: Routes = [
  {
    path: 'students',
    title: 'Observation Student Configuration',
    data: {
      icon: 'manage_accounts',
    },
    loadComponent: () => import('../../configuration/student-configuration/student-configuration.component').then(m =>
      m.StudentConfigurationComponent),
    children: [
      {
        path: `:${observationBehaviorRouteParamKeys.studentId}`,
        title: 'Edit Student Configuration',
        loadComponent: () => import('../../configuration/student-configuration/edit-student/edit-student.component').then(m =>
          m.EditStudentComponent),
        resolve: [selectedStudentResolver],
      },
    ],
  },
];
