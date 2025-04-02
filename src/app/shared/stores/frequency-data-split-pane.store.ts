import { computed } from '@angular/core';
import { signalStore, withComputed } from '@ngrx/signals';
import { frequencyRouteKeys } from '../../frequency/frequency-base.routes';
import { ExtendedAppRoute } from '../../models';
import {
  RouterLinkElementType,
  RouterLinkOutlet,
  RouterLinkType,
  routerLinkTypeIsArray,
} from '../../models/route-link.types';
import { PersonId } from '../../scheduler-base/models/person-type.model';
import { SplitPaneState, withSplitPane } from './features/split-pane.feature.store';

const initialFrequencyDataSplitPaneState: SplitPaneState = {
  routeBaseFromRoot: ['frequency-data'],
  leftPane: {
    showPane: true,
    routeBase: [frequencyRouteKeys.base.dashboard],
  },
  rightPane: {
    showPane: false,
    routeBase: [],
    outletKey: 'configuration',
    outletPath: [frequencyRouteKeys.base.config, 'frequency-configuration'],
  },
  slimResizer: false,
};

// ! This should always be provided at the route level for the parent route.
// TODO: We need to make sure it gets disposed of/not referenced correctly though.
export const FrequencyDataSplitPaneStore = signalStore(
  withSplitPane(initialFrequencyDataSplitPaneState),
  withComputed((store) => ({
    routeToObservationBehaviorConfig: computed(() => {

      const outletPath: Array<string> = [...store.rightPane.outletPath(), 'behaviors'];
      return [
        ...store.routeToRightPane(),
        {
          outlets: {
            [store.rightPane.outletKey()]: outletPath,
          },
        },
      ];
    }),
    routeToStudentConfig: computed(() => {
      const outletPath: Array<string> = [...store.rightPane.outletPath(), 'students'];
      return [
        ...store.routeToRightPane(),
        {
          outlets: {
            [store.rightPane.outletKey()]: outletPath,
          },
        },
      ];
    }),
  })),
  withComputed((store) => ({

    specificStudentRoute: computed(() => {
      const studentRouteConfig: RouterLinkType = [...store.routeToStudentConfig()];
      const outletKey = store.rightPane.outletKey();
      const outletRoute: RouterLinkElementType | undefined = studentRouteConfig.pop();

      if (outletRoute) {

        // Return a function from computed() so it can be called with a specific value.
        return (studentId: PersonId | undefined) => {
          if (!studentId) {
            return studentRouteConfig;
          }

          if (isRouterLinkOutlet(outletRoute) && routerLinkTypeIsArray(outletRoute.outlets[outletKey])) {

            const newOutletRoute = {
              ...outletRoute,
              outlets: {
                [outletKey]: [...outletRoute.outlets[outletKey], studentId],
              },
            };

            return [
              ...studentRouteConfig,
              newOutletRoute,
            ];
          } else {
            return [
              ...studentRouteConfig,
              outletRoute,
            ];
          }
        };
      } else {
        return () => [];
      }
    }),
  })),
  withComputed((store) => ({
    configRoutes: computed((): Array<ExtendedAppRoute> => {
      return [
        {
          path: store.routeToObservationBehaviorConfig(),
          name: 'Observation Behaviors',
          icon: 'psychology',
        },
        {
          path: store.routeToStudentConfig(),
          name: 'Students',
          icon: 'manage_accounts',
        },
      ];
    }),
  })),
);

function isRouterLinkOutlet(outletRoute: RouterLinkElementType): outletRoute is RouterLinkOutlet {
  if (outletRoute && typeof outletRoute !== 'string' && Object.hasOwn(outletRoute, 'outlets')) {
    return true;
  }

  return false;
}
