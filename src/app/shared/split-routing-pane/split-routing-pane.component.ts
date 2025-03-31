import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  contentChild,
  inject,
  input,
  InputSignal,
  OnDestroy,
  Signal,
  TemplateRef,
} from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatToolbar } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { GlobalUIService } from '../../core/app-sidenav-service/global-ui.service';
import { DeviceTypeService } from '../../core/device-type/device-type.service';
import { SettingsStore } from '../../settings/settings.store';
import { ResizerDirective } from '../resizer/resizer.directive';
import { PanelState } from '../resizer/resizer.models';

export interface MenuItem {
  route: typeof RouterLink;
  routeName: string;
}

export interface ToolMenu {
  menuTitle: string,
  items: Array<MenuItem | ToolMenu>;
}

@Component({
  selector: 'eu-split-routing-pane',
  imports: [
    MatToolbar,
    NgTemplateOutlet,
    MatIcon,
    MatIconButton,
    ResizerDirective,
  ],
  templateUrl: './split-routing-pane.component.html',
  styleUrl: './split-routing-pane.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SplitRoutingPaneComponent implements OnDestroy {
  // public readonly menuConfiguration: InputSignal<Array<ToolMenu>> = input.required();
  public readonly deviceTypeService: DeviceTypeService = inject(DeviceTypeService);
  private readonly globalUIService: GlobalUIService = inject(GlobalUIService);
  private readonly settingsStore = inject(SettingsStore);

  public panelOneState: PanelState = 'open';
  public panelTwoState: PanelState = 'open';

  public readonly toolbarContent: Signal<TemplateRef<unknown>> = contentChild.required('toolbarContent');
  public readonly leftPanelOutlet: Signal<TemplateRef<unknown> | undefined> = contentChild('leftPanelOutlet');
  public readonly rightPanelOutlet: Signal<TemplateRef<unknown> | undefined> = contentChild('rightPanelOutlet');
  public readonly showResizeHandle: InputSignal<boolean> = input.required<boolean>();
  // public readonly configurationRoutes: Array<AppRoute> = scheduleConfigurationAppRoutes(false);

  // TODO: If you get infinite loops here... Change from Signal, to just number.
  public readonly splitPercent = this.settingsStore.schedulerSettings.panelSplitPercentage;

  public readonly shouldOverlayRightPanel = this.deviceTypeService.shouldOverlayRightPanel;

  constructor() {
    this.globalUIService.setGlobalUI({ showAppTitleBar: false, sidenavStyle: 'slim' });
  }

  public ngOnDestroy(): void {
    this.globalUIService.setGlobalUI({ showAppTitleBar: true, sidenavStyle: 'default' });
  }

  public splitChange(splitPercentage: number): void {
    this.settingsStore.updateSchedulerPanelSplitPercent(splitPercentage);
  }
}
