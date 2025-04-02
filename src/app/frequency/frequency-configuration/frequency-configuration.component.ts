import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { MatIconAnchor } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTabLink, MatTabNav, MatTabNavPanel } from '@angular/material/tabs';
import { MatTooltip } from '@angular/material/tooltip';

import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AppRoute } from '../../models';
import { frequencyConfigurationAppRoutes } from './frequency-configuration.routes';

@Component({
  selector: 'eu-frequency-configuration',
  imports: [
    MatTabNav,
    MatTabNavPanel,
    RouterOutlet,
    MatTabLink,
    RouterLinkActive,
    RouterLink,
    MatIconAnchor,
    MatIcon,
    MatTooltip,
  ],
  templateUrl: './frequency-configuration.component.html',
  styleUrl: './frequency-configuration.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FrequencyConfigurationComponent {
  public readonly configurationRoutes: WritableSignal<Array<AppRoute>> = signal([]);

  constructor() {
    this.configurationRoutes.set(frequencyConfigurationAppRoutes(false));
  }
}
