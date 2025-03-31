import { Routes } from '@angular/router';
import { selectedObservationBehaviorResolver } from '../../resolvers/selected-observation-behavior.resolver';

export const observationBehaviorRouteParamKeys: Readonly<{ observationBehaviorId: string, studentId: string }> = {
  observationBehaviorId: 'observationBehaviorId',
  studentId: 'studentId',
};

export const observationBehaviorConfigurationRoutes: Routes = [
  {
    path: 'behaviors',
    title: 'Observation Behaviors',
    data: {
      icon: 'monitoring',
    },
    loadComponent: () => import('./all-observation-behaviors-configuration.component').then(m =>
      m.AllObservationBehaviorsConfigurationComponent),
    children: [
      {
        path: `:${observationBehaviorRouteParamKeys.observationBehaviorId}`,
        title: 'Observation Behavior',
        loadComponent: () => import('./observation-behavior-configuration/observation-behavior-configuration.component').then(m =>
          m.ObservationBehaviorConfigurationComponent),
        resolve: [selectedObservationBehaviorResolver],
      },
    ],
  },
];
