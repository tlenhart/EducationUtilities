import { Route, Routes } from '@angular/router';
import { AppRoute } from '../models';

export const frequencyRouteKeys = {
  base: {
    dashboard: 'frequency-dashboard',
    record: 'frequency-records',
    reporting: 'frequency-reporting',
    config: 'config',
  },
};

// Left Pane
const frequencyBaseRoutes_leftPane: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: frequencyRouteKeys.base.dashboard,
  },
  {
    path: frequencyRouteKeys.base.dashboard,
    title: 'Frequency Dashboard',
    data: {
      icon: 'monitoring',
    },
    loadComponent: () => import('./frequency-dashboard/frequency-dashboard.component').then(m =>
      m.FrequencyDashboardComponent),
  },
  {
    path: frequencyRouteKeys.base.record,
    title: 'Frequency Records',
    data: {
      icon: 'monitoring',
    },
    loadChildren: () => import('./frequency-record/frequency-record.routes').then(m =>
      m.frequencyRecordRoutes),
  },
  {
    path: frequencyRouteKeys.base.reporting,
    title: 'Frequency Reports',
    data: {
      icon: 'monitoring',
    },
    loadChildren: () => import('./frequency-reporting/frequency-reporting.routes').then(m =>
      m.frequencyReportingRoutes),
  },
];

// Right Pane
const frequencyBaseRoutes_rightPane: Routes = [
  {
    path: frequencyRouteKeys.base.config,
    title: 'Frequency Data Configuration',
    data: {
      icon: 'monitoring',
    },
    loadChildren: () => import('./frequency-configuration/frequency-configuration.routes').then(m =>
      m.frequencyConfigurationRoutes),
    outlet: 'configuration',
  },
];

// Panes are defined/referenced in the frequency-base component.
export const frequencyBaseRoutes: Routes = [
  ...frequencyBaseRoutes_leftPane,
  ...frequencyBaseRoutes_rightPane,
];

export function frequencyLeftPaneBaseAppRoutes(withRelative: boolean): Array<AppRoute> {
  return frequencyBaseRoutes_leftPane
    .filter((route: Route) => route.path)
    .map((route: Route): AppRoute => {
      return {
        path: withRelative ? `./${route.path ?? './'}` : route.path ?? '',
        name: typeof route.title === 'string' ? route.title : 'Utility',
        icon: (route.data?.['icon']) as string | undefined ?? '',
      };
    });
}

export function frequencyRightPaneBaseAppRoutes(withRelative: boolean): Array<AppRoute> {
  return frequencyBaseRoutes_rightPane
    .filter((route: Route) => route.path)
    .map((route: Route): AppRoute => {
      return {
        path: withRelative ? `./${route.path ?? './'}` : route.path ?? '',
        name: typeof route.title === 'string' ? route.title : 'Configuration',
        icon: (route.data?.['icon']) as string | undefined ?? '',
      };
    });
}

export function frequencyRouteBuilder(
  relative: boolean,
  base: keyof typeof frequencyRouteKeys.base,
  subRoute1?: string): Array<string | { outlets: { configuration: Array<string> } }> {
  const builtRoute: Array<string | { outlets: { configuration: Array<string> } }> = relative ? ['./'] : [];

  switch (base) {
    case 'dashboard':
      builtRoute.push(frequencyRouteKeys.base[base]);
      break;
    case 'record':
      builtRoute.push(frequencyRouteKeys.base[base]);
      break;
    case 'reporting':
      builtRoute.push(frequencyRouteKeys.base[base]);
      break;
    case 'config':
      builtRoute.push({ outlets: { configuration: [frequencyRouteKeys.base[base]] } }); // ['./', { outlets: { configuration: ['config', route.path] } }]
      // builtRoute.push(frequencyRouteKeys.base[base]);
      break;
    // default: {
    //   return ['./'];
    // }
  }

  if (subRoute1) {
    builtRoute.push(subRoute1);
  }

  // if (base === 'config') {
  //   ['./', { outlets: { configuration: ['config', route.path] } }]
  // }

  return builtRoute;
}

export function frequencyConfigRouteBuilder(
  basePathOrRelative: true | string,
  component: string,
  id?: string | number): Array<string | { outlets: { configuration: Array<string> } }> {
  const builtRoute: Array<string | {
    outlets: { configuration: Array<string> }
  }> = basePathOrRelative === true ? ['./'] : [basePathOrRelative];

  // TODO: Needs updates.
  const configurationOutlet = { outlets: { configuration: [frequencyRouteKeys.base.config, 'frequency-configuration', component] } };

  if (id) {
    configurationOutlet.outlets.configuration.push(id.toString());
  }

  builtRoute.push(configurationOutlet);
  // return ['frequency-configuration']

  return builtRoute;
}
