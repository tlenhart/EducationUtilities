import { ChangeDetectionStrategy, Component, inject, input, InputSignal } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatListItem, MatNavList } from '@angular/material/list';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { GlobalUIService } from '../../core/app-sidenav-service/global-ui.service';
import { AppVersionService } from '../../core/version/app-version.service';
import { AppRoute } from '../../models';
import { copyToClipboard } from '../../utils/dom.utils';

@Component({
  selector: 'app-main-sidenav',
  imports: [
    MatListItem,
    MatNavList,
    RouterLinkActive,
    RouterLink,
    MatIcon,
    MatTooltip,
    MatIconButton,
  ],
  templateUrl: './main-sidenav.component.html',
  styleUrl: './main-sidenav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainSidenavComponent {
  public readonly routes: InputSignal<Array<AppRoute>> = input.required<Array<AppRoute>>();
  public readonly sidenavService: GlobalUIService = inject(GlobalUIService);
  public readonly appVersionService: AppVersionService = inject(AppVersionService);

  public async copyVersionInformation(): Promise<void> {
    await copyToClipboard(JSON.stringify(this.appVersionService.version(), undefined, 2));
  }
}
