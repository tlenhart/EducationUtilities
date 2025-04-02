import { UrlTree } from '@angular/router';

export type RouterLinkOutletConfig = Record<string, RouterLinkType>;
// export type RouterLinkType = Array<string | { outlets: { configuration: Array<string> } }> | UrlTree | string;

export interface RouterLinkOutlet {
  outlets: RouterLinkOutletConfig;
}

export type RouterLinkElementType = string | RouterLinkOutlet | UrlTree;

export type RouterLinkType = Array<RouterLinkElementType> | UrlTree | string;

export function routerLinkTypeIsArray(link: RouterLinkType): link is Array<string | RouterLinkOutlet> {
  return Array.isArray(link);
}
