import { ChangeDetectionStrategy, Component, inject, input, InputSignal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatListItem, MatNavList } from '@angular/material/list';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { GlobalUIService } from '../../core/app-sidenav-service/global-ui.service';
import { AppVersionService } from '../../core/version/app-version.service';
import { FeedbackDialogComponent } from '../../feedback-dialog/feedback-dialog.component';
import { AppRoute } from '../../models';
import { buildWidthString } from '../../utils/css.utils';
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
    MatButton,
  ],
  templateUrl: './main-sidenav.component.html',
  styleUrl: './main-sidenav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainSidenavComponent {
  public readonly routes: InputSignal<ReadonlyArray<AppRoute>> = input.required<ReadonlyArray<AppRoute>>();
  public readonly sidenavService: GlobalUIService = inject(GlobalUIService);
  public readonly appVersionService: AppVersionService = inject(AppVersionService);
  public readonly dialog: MatDialog = inject(MatDialog);

  public async copyVersionInformation(): Promise<void> {
    await copyToClipboard(JSON.stringify(this.appVersionService.version(), undefined, 2));
  }

  public openFeedbackDialog(): void {
    this.dialog.open(FeedbackDialogComponent, {
      width: buildWidthString(`400px`, `600px`),
    });
  }
}
