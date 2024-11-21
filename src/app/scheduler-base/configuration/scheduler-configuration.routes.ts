import { Route, Routes } from '@angular/router';
import { AppRoute } from '../../models';
import { aidConfigurationRoutes } from './aid-configuration/aid-configuration.routes';
import { teacherConfigurationRoutes } from './teacher-configuration/teacher-configuration.routes';

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
        path: 'all',
        title: 'All',
        data: {
          icon: '',
        },
        loadComponent: () => import('./schedule-all-people-types/schedule-all-people-types.component').then(m =>
          m.ScheduleAllPeopleTypesComponent),
      },
      ...aidConfigurationRoutes,
      {
        path: 'students',
        title: 'Students',
        data: {
          icon: 'edit_calendar',
        },
        loadComponent: () => import('./student-configuration/student-configuration.component').then(m =>
          m.StudentConfigurationComponent),
      },
      ...teacherConfigurationRoutes,
      {
        path: 'groups',
        title: 'Groups',
        data: {
          icon: '',
        },
        loadComponent: () => import('./group-configuration/group-configuration.component').then(m =>
          m.GroupConfigurationComponent),
      },
      {
        path: 'sidebar-analysis',
        title: 'Analysis',
        data: {
          icon: 'edit_calendar',
        },
        loadComponent: () => import('../analysis/sidebar-analysis/sidebar-analysis.component').then(m =>
          m.SidebarAnalysisComponent),
      },
    ],
  },
];

export function scheduleConfigurationAppRoutes(withRelative: boolean): Array<AppRoute> {
  return scheduleConfigurationRoutes
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
