import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatTabLink, MatTabNav, MatTabNavPanel } from '@angular/material/tabs';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'eu-schedule-config-base',
  standalone: true,
  imports: [
    MatTabNav,
    MatTabLink,
    MatTabNavPanel,
    RouterOutlet,
    RouterLink,
  ],
  templateUrl: './schedule-config-base.component.html',
  styleUrl: './schedule-config-base.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleConfigBaseComponent {

}
