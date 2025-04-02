import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatSidenav } from '@angular/material/sidenav';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatToolbar } from '@angular/material/toolbar';
import { Observable } from 'rxjs';
import { DeviceTypeService } from '../../core/device-type/device-type.service';

export type ThemeType = 'default-theme' | 'wave-theme' | 'pink-wave-theme';

@Component({
  selector: 'app-main-toolbar',
  imports: [
    AsyncPipe,
    MatIcon,
    MatIconButton,
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
  // public theme: 'light' | 'dark' = 'light';
  public theme: ThemeType = 'default-theme';

  constructor() {
    this.isHandset$ = this.deviceTypeService.isHandset$;
  }

  public switchTheme(event: MatSlideToggleChange): void {
    const body: HTMLBodyElement | null = document.querySelector('body');

    if (!body) {
      return;
    }

    if (event.checked) {
      this.theme = 'wave-theme';
    } else {
      this.theme = 'default-theme';
    }

    body.classList.toggle('wave-theme');
    body.classList.toggle('default-theme');
  }

  public switchTheme2(themeName: ThemeType): void {
    const body: HTMLBodyElement | null = document.querySelector('body');

    if (!body) {
      return;
    }

    this.theme = themeName;

    body.classList.remove('pink-wave-theme');
    body.classList.remove('wave-theme');
    body.classList.remove('default-theme');

    body.classList.add(this.theme);
  }
}
