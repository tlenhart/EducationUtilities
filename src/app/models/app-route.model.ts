import { RouterLinkType } from './route-link.types';

export interface AppRoute {
  path: string;
  name: string;
  icon: string;
}

export type ExtendedAppRoute = Omit<AppRoute, 'path'> & {
  path: RouterLinkType; // Array<string | RouterLinkOutlet | UrlTree>;
};
