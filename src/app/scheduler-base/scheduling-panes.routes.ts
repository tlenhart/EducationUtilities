import { Routes } from '@angular/router';

export const schedulingPanesRoutes: Routes = [
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
