import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggle, MatSlideToggleChange } from "@angular/material/slide-toggle";
import { MatToolbarModule } from '@angular/material/toolbar';
import { Route, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { map, Observable, shareReplay } from 'rxjs';
import { routes } from "./app.routes";
import { AppRoute } from "./models";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatSlideToggle,
    AsyncPipe,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  public title = 'EducationUtilities';
  public theme: 'light' | 'dark' = 'light';
  public routes: Array<AppRoute> = [];
  public isHandset$: Observable<boolean>;

  private breakpointObserver = inject(BreakpointObserver);

  constructor() {
    // Just look at the root routes to determine primary routing.
    this.routes = [
      { path: '/', name: 'Main' },
      ...routes.map((route: Route): AppRoute | null => {
        if (!route.path && route.path !== '') {
          return null;
        }
        return {
          path: `/${route.path}`,
          name: `${route.path[0].toLocaleUpperCase()}${route.path?.slice(1).replace('-', ' ')}`,
        };
      }).filter((value: AppRoute | null) => value !== null),
    ];

    this.isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset)
      .pipe(
        map(result => result.matches),
        shareReplay(),
      );
  }

  public switchTheme(event: MatSlideToggleChange): void {
    const body: HTMLBodyElement | null = document.querySelector('body');

    if (!body) {
      return;
    }

    if (event.checked) {
      this.theme = 'dark';
    } else {
      this.theme = 'light';
    }

    body.classList.toggle('dark');
    body.classList.toggle('light');
  }
}
