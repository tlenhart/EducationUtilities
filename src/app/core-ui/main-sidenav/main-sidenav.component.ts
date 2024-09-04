import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { MatListItem, MatNavList } from '@angular/material/list';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AppRoute } from '../../models';

@Component({
  selector: 'app-main-sidenav',
  standalone: true,
  imports: [
    MatListItem,
    MatNavList,
    RouterLinkActive,
    RouterLink
  ],
  templateUrl: './main-sidenav.component.html',
  styleUrl: './main-sidenav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainSidenavComponent {
  public readonly routes: InputSignal<Array<AppRoute>> = input.required<Array<AppRoute>>();
}
