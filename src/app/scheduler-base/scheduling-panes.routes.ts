import { Routes } from '@angular/router';

const defaultOutlet: Routes = [
  {
    path: 'editors',
    title: 'Editors',
    data: {
      icon: 'edit_calendar',
    },
    loadChildren: () => import('./editors/scheduler-editors.routes').then(m =>
      m.scheduleEditorsRoutes),
  },
  {
    path: 'reports',
    title: 'Reports for ...',
    data: {
      icon: 'edit_calendar',
    },
    loadChildren: () => import('./reports/reports.routes').then(m =>
      m.reportsRoutes),
  },
]

const configurationOutlet: Routes = [
  {
    path: 'config',
    title: 'Scheduler Configuration',
    data: {
      icon: 'edit_calendar',
    },
    loadChildren: () => import('./configuration/scheduler-configuration.routes').then(m =>
      m.scheduleConfigurationRoutes),
    outlet: 'configuration',
  },
];

export const schedulingPanesRoutes: Routes = [
  ...defaultOutlet,
  ...configurationOutlet,
];
