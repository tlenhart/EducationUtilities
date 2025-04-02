import { Routes } from '@angular/router';
import { GlobalRouteParams } from '../../models/global-route-params.model';
import {
  primarySelectedStudentResolver,
} from '../../scheduler-base/resolvers/selected-student/selected-student.resolver';
import { observationSessionResolver } from '../resolvers/observation-session.resolver';

export const frequencyRecordRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'observation-sessions',
  },
  {
    path: 'observation-sessions',
    title: 'Observation Sessions',
    data: {
      icon: 'assignment',
    },
    loadComponent: () => import('./observation-session/observation-session.component').then(m =>
      m.ObservationSessionComponent),
    children: [
      {
        path: `:${GlobalRouteParams.primaryStudentId}`,
        title: 'Student Observation Sessions',
        data: {
          icon: 'assignment',
        },
        resolve: [
          primarySelectedStudentResolver,
        ],
        loadComponent: () => import('./observation-session/student-observation-sessions/student-observation-sessions.component').then(m =>
          m.StudentObservationSessionsComponent),
      },
    ],
  },
  {
    path: 'observation-session-form',
    title: 'Observation Session for Student',
    data: {
      icon: 'assignment_add',
    },
    loadComponent: () => import('./observation-session/observation-session-form-base/observation-session-form-base.component').then(m =>
      m.ObservationSessionFormBaseComponent),
    children: [
      {
        // TODO: This could be a child frequency-record, and frequency-record, could not be double nested (in the path).
        path: `:${GlobalRouteParams.observationSessionId}`,
        title: 'Observation Session',
        data: {
          icon: 'monitoring',
        },
        resolve: [
          // primarySelectedStudentResolver,
          observationSessionResolver,
        ],
        loadComponent: () => import('./observation-session/current-observation-session/current-observation-session.component').then(m =>
          m.CurrentObservationSessionComponent),
      },
    ]
  },
];
