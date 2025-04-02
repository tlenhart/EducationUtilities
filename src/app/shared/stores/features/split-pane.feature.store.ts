import { computed } from '@angular/core';
import { UrlTree } from '@angular/router';
import { patchState, signalStoreFeature, withComputed, withMethods, withState } from '@ngrx/signals';
import { RouterLinkOutlet, RouterLinkType } from '../../../models/route-link.types';

export interface PaneState {
  showPane: boolean;
  routeBase: RouterLinkType,
  // outlets?: RouterLinkOutletConfig;
  outletKey?: string;
  outletPath?: Array<string>; // RouterLinkType
}

export interface SplitPaneState {
  routeBaseFromRoot: Array<string>, // RouterLinkType
  slimResizer: boolean;
  leftPane: PaneState;
  rightPane: Required<PaneState>;
}

// ! This should always be provided at the route level for the parent route.
// TODO: We need to make sure it gets disposed of/not referenced correctly though.
export function withSplitPane(initialState: SplitPaneState) {
  return signalStoreFeature(
    withState<SplitPaneState>(initialState),
    withMethods((store) => ({
      // TODO: Find a better way so you don't always have to call this.
      navigateToRightRoute(): void {
        patchState(store, (state) => ({
          rightPane: {
            ...state.rightPane,
            showPane: true,
          },
        }));
      },
      navigateAwayFromRightRoute(): void {
        patchState(store, (state) => ({
          rightPane: {
            ...state.rightPane,
            showPane: false,
          },
        }));
      },
    })),
    withComputed(({ routeBaseFromRoot, leftPane, rightPane }) => ({
      routeToLeftPane: computed(() => createRouteFromPane(routeBaseFromRoot(), rightPane.routeBase())),
      routeToRightPane: computed(() => createRouteFromPane(routeBaseFromRoot(), rightPane.routeBase())),
      showLeftPane: computed(() => leftPane.showPane()),
      showRightPane: computed(() => rightPane.showPane()),
      showDivider: computed(() => {
        // Split apart the signal tracking to ensure changes to one changes the computed signal.
        const showLeftPane = leftPane.showPane();
        const showRightPane = rightPane.showPane();

        return showLeftPane && showRightPane;
      }),
    })),
  );
}

function createRouteFromPane(routeBaseFromRoot: Array<string>, routeBase: RouterLinkType): Array<string | UrlTree | RouterLinkOutlet> {
  let rightPaneRouteArray: Array<string | UrlTree | RouterLinkOutlet> = [];

  if (Array.isArray(routeBase)) {
    rightPaneRouteArray = [...routeBase];
  } else if (typeof routeBase === 'string') {
    rightPaneRouteArray = [routeBase];
  } else {
    rightPaneRouteArray = [routeBase];
  }

  return [
    '/',
    ...routeBaseFromRoot,
    ...rightPaneRouteArray,
  ];
}
