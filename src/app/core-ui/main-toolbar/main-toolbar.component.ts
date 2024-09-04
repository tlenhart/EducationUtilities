import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatSidenav } from '@angular/material/sidenav';
import { MatSlideToggle, MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatToolbar } from '@angular/material/toolbar';
import { Observable } from 'rxjs';
import { DeviceTypeService } from '../../core/device-type/device-type.service';

@Component({
  selector: 'app-main-toolbar',
  standalone: true,
  imports: [
    AsyncPipe,
    MatIcon,
    MatIconButton,
    MatSlideToggle,
    MatToolbar,
  ],
  templateUrl: './main-toolbar.component.html',
  styleUrl: './main-toolbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainToolbarComponent {
  public drawer = input<MatSidenav>();
  public readonly isHandset$: Observable<boolean>;
  private readonly deviceTypeService: DeviceTypeService = inject(DeviceTypeService);
  public theme: 'light' | 'dark' = 'light';

  constructor() {
    this.isHandset$ = this.deviceTypeService.isHandset$;
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
