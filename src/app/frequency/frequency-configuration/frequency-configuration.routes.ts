import { Route, Routes } from '@angular/router';
import { AppRoute } from '../../models';
import { hideRightPaneDeactivateFn, showRightPaneResolver } from '../resolvers/show-right-pane.resolver';
import {
  observationBehaviorConfigurationRoutes,
} from './all-observation-behaviors-configuration/observation-behavior-configuration.routes';
import { observationStudentConfigRoutes } from './observation-student-config.routes';

export const frequencyConfigurationRoutes: Routes = [
  {
    path: '',
    redirectTo: 'frequency-configuration',
    pathMatch: 'full',
  },
  {
    path: 'frequency-configuration',
    title: 'Frequency Data Configuration',
    data: {
      icon: 'monitoring',
    },
    loadComponent: () => import('./frequency-configuration.component').then(m =>
      m.FrequencyConfigurationComponent),
    resolve: [showRightPaneResolver],
    canDeactivate: [hideRightPaneDeactivateFn],
    children: [
      ...observationBehaviorConfigurationRoutes,
      ...observationStudentConfigRoutes,
    ],
  },
];

export function frequencyConfigurationAppRoutes(withRelative: boolean): Array<AppRoute> {
  return frequencyConfigurationRoutes
    .find((route: Route) => Array.isArray(route.children))
    ?.children
    ?.map((route: Route): AppRoute => {
      return {
        path: withRelative ? `./${route.path ?? './'}` : route.path ?? '',
        name: typeof route.title === 'string' ? route.title : 'Configuration',
        icon: (route.data?.['icon']) as string | undefined ?? '',
      };
    }) ?? [];
}
