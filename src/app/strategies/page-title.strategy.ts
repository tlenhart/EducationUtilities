import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class PageTitleStrategy extends TitleStrategy {
  constructor(private readonly title: Title) {
    super();
  }

  public override updateTitle(snapshot: RouterStateSnapshot): void {
    let title: string | undefined = this.buildTitle(snapshot);

    if (title === undefined) {
      // TODO: .split() may not be necessary here due to the usage of this.buildTitle(snapshot) above.
      // TODO: If it's not needed for nested routes, remove the splitting here and just slice after it.
      const pathSegments: Array<string> = snapshot.url.split('/').filter((pathSegment: string) => !!pathSegment);
      const path = pathSegments.at(-1);

      if (!path) {
        this.title.setTitle('Education Utilities');
        return;
      }

      title = `${path[0].toLocaleUpperCase()}${path.slice(1).replace('-', ' ')}`;
    }

    this.title.setTitle(`Education Utilities | ${title}`);
  }
}
