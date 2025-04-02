import { Routes } from '@angular/router';
import { CurrentObservationSessionStore } from '../shared/stores/current-observation-session.store';
import { FrequencyDataSplitPaneStore } from '../shared/stores/frequency-data-split-pane.store';
import { ObservationEntriesStore } from '../shared/stores/observation-entries.store';
import { StudentStore } from '../shared/stores/student.store';

export const frequencyRoutes: Routes = [
  {
    path: 'frequency-data',
    title: 'Frequency Record',
    data: {
      icon: 'monitoring',
    },
    providers: [
      StudentStore,
      ObservationEntriesStore,
      CurrentObservationSessionStore,
      FrequencyDataSplitPaneStore,
    ],
    loadComponent: () => import('./frequency-base/frequency-base.component').then(m =>
      m.FrequencyBaseComponent),
    loadChildren: () => import('./frequency-base.routes').then(m =>
      m.frequencyBaseRoutes),
  },
];
