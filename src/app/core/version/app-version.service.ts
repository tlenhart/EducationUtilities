import { computed, Injectable, signal, Signal, WritableSignal } from '@angular/core';
import { appVersion } from '../../../environments/app-version';
import { AppVersion } from '../../models/app-version.model';

@Injectable({
  providedIn: 'root',
})
export class AppVersionService {
  private readonly currentVersion: WritableSignal<AppVersion> = signal(appVersion);
  public readonly version: Signal<AppVersion> = this.currentVersion.asReadonly();
  public readonly versionMessage: Signal<string> = computed(() => `Version: ${this.currentVersion().gitVersion}. Build Date: ${this.currentVersion().buildDate}`);
  public readonly multiLineVersionMessage: Signal<string> = computed(() => `Version: ${this.currentVersion().gitVersion}\nBuild Date: ${this.currentVersion().buildDate}`);
  public readonly multiLineVersionMessageClickToCopy: Signal<string> = computed(() => `${this.multiLineVersionMessage()}\nClick to copy version info.`);
}
