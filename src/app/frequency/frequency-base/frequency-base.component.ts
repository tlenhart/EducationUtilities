import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal, Signal } from '@angular/core';
import { MatAnchor, MatButton } from '@angular/material/button';
import { MatMenu, MatMenuContent, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { RouterLink, RouterOutlet } from '@angular/router';
import { DeviceTypeService } from '../../core/device-type/device-type.service';
import { AppRoute } from '../../models';
import { SplitRoutingPaneComponent } from '../../shared/split-routing-pane/split-routing-pane.component';
import { FrequencyDataSplitPaneStore } from '../../shared/stores/frequency-data-split-pane.store';
import { frequencyLeftPaneBaseAppRoutes } from '../frequency-base.routes';

@Component({
  selector: 'eu-frequency-base',
  imports: [
    MatButton,
    MatMenu,
    MatMenuContent,
    MatMenuItem,
    SplitRoutingPaneComponent,
    MatMenuTrigger,
    RouterLink,
    MatAnchor,
    RouterOutlet,
    AsyncPipe,
  ],
  templateUrl: './frequency-base.component.html',
  styleUrl: './frequency-base.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FrequencyBaseComponent {
  public readonly deviceTypeService: DeviceTypeService = inject(DeviceTypeService);
  public readonly primaryFrequencyRoutes: Signal<Array<AppRoute>> = signal(frequencyLeftPaneBaseAppRoutes(false));
  public readonly frequencyDataSplitPaneStore = inject(FrequencyDataSplitPaneStore);
}
