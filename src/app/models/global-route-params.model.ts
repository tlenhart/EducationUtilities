import { entityType } from '../shared/stores/features/with-entities-type.store.feature';
import { ObservationSessionId } from './observation.model';

export const GlobalRouteParams = {
  // ! Make sure to not use the same parameter names for the configuration and primary ids.
  primaryStudentId: 'primaryStudentId',
  observationSessionId: 'observationSessionId',
} as const;

export const GlobalQueryParams = {
  openedSessions: {
    name: 'openedSessions',
    type: Array<ObservationSessionId>,
  },
  showCharts: {
    name: 'showCharts',
    type: Array<ObservationSessionId>,
  },
  showComparisonStudent: {
    name: 'showComparisonStudent',
    type: Array<ObservationSessionId>,
  },
  showBehaviorConfiguration: {
    name: 'showBehaviorConfiguration', // TODO: Actually use this.
    type: entityType<boolean>,
  },
} as const;
