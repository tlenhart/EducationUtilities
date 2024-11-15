import { ChangeDetectionStrategy, Component, inject, OnDestroy } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatToolbar } from '@angular/material/toolbar';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AppSidenavService } from '../core/app-sidenav-service/app-sidenav.service';
import { ResizerDirective } from '../shared/resizer/resizer.directive';
import { PanelState } from '../shared/resizer/resizer.models';

@Component({
  selector: 'eu-scheduler-base',
  standalone: true,
  imports: [
    MatIcon,
    ResizerDirective,
    RouterOutlet,
    RouterLink,
    MatToolbar,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    MatButton,
    MatIconButton,
  ],
  templateUrl: './scheduler-base.component.html',
  styleUrl: './scheduler-base.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchedulerBaseComponent implements OnDestroy {
  private readonly sidenavService: AppSidenavService = inject(AppSidenavService);

  public panelOneState: PanelState = 'open';
  public panelTwoState: PanelState = 'open';

  constructor() {
    this.sidenavService.setSlimSidebar();
  }

  public ngOnDestroy(): void {
    this.sidenavService.setDefaultSidebar();
  }
}
