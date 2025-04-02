import { Routes } from '@angular/router';

export const aidConfigurationRoutes: Routes = [
  {
    path: 'aids',
    title: 'Aids',
    data: {
      icon: 'edit_calendar',
    },
    loadComponent: () => import('./aid-configuration.component').then(m =>
      m.AidConfigurationComponent),
    children: [
      {
        path: ':id',
        title: 'Aid',
        loadComponent: () => import('./edit-aid/edit-aid.component').then(m =>
          m.EditAidComponent),
      },
    ],
  },
];
