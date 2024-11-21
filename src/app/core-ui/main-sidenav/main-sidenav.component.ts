import { ChangeDetectionStrategy, Component, inject, input, InputSignal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatListItem, MatNavList } from '@angular/material/list';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { GlobalUIService } from '../../core/app-sidenav-service/global-ui.service';
import { AppRoute } from '../../models';

@Component({
  selector: 'app-main-sidenav',
  standalone: true,
  imports: [
    MatListItem,
    MatNavList,
    RouterLinkActive,
    RouterLink,
    MatIcon,
  ],
  templateUrl: './main-sidenav.component.html',
  styleUrl: './main-sidenav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainSidenavComponent {
  public readonly routes: InputSignal<Array<AppRoute>> = input.required<Array<AppRoute>>();
  public readonly sidenavService: GlobalUIService = inject(GlobalUIService);
}
