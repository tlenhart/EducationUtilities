import { computed, inject, Injectable, OnDestroy, signal, Signal, WritableSignal } from '@angular/core';
import { SwUpdate, UnrecoverableStateEvent, VersionEvent } from '@angular/service-worker';
import { Subscription } from 'rxjs';
import { appVersion } from '../../../environments/app-version';
import { AngularHashVersion, AppVersion, FullVersionInfo } from '../../models/app-version.model';

@Injectable({
  providedIn: 'root',
})
export class AppVersionService implements OnDestroy {
  private readonly currentVersion: WritableSignal<AppVersion> = signal(appVersion);
  private readonly currentAngularHashVersion: WritableSignal<AngularHashVersion> = signal({
    currentAngularHash: '',
    latestAngularHash: '',
    swEventState: 'unloaded',
    swIsEnabled: false,
  });

  public readonly version: Signal<FullVersionInfo> = computed(() => {
    return {
      appVersion: this.currentVersion(),
      angularVersion: this.currentAngularHashVersion(),
      userAgent: navigator.userAgent,
    };
  });
  public readonly versionMessage: Signal<string> = computed(() => `Version: ${this.currentVersion().gitVersion}. Build Date: ${this.currentVersion().buildDate}`);
  public readonly multiLineVersionMessage: Signal<string> = computed(() => `Version: ${this.currentVersion().gitVersion}\nBuild Date: ${this.currentVersion().buildDate}`);
  public readonly multiLineVersionMessageClickToCopy: Signal<string> = computed(() => `${this.multiLineVersionMessage()}\nClick to copy version info.`);

  private readonly subscriptions: Subscription = new Subscription();

  private readonly swService: SwUpdate = inject(SwUpdate);

  constructor() {
    this.currentAngularHashVersion.update((current) => {
      return {
        ...current,
        swIsEnabled: this.swService.isEnabled,
      };
    });

    this.subscriptions.add(
      this.swService.versionUpdates.subscribe({
        next: (versionEvent: VersionEvent) => {
          const versionUpdate: Partial<AngularHashVersion> = {
            swEventState: versionEvent.type,
          };

          // See: https://angular.dev/ecosystem/service-workers/communications#example-1
          // TODO: Make sure these properties are being set to the correct values.
          switch (versionEvent.type) {
            case 'VERSION_DETECTED':
              versionUpdate.latestAngularHash = versionEvent.version.hash;
              break;
            case 'VERSION_INSTALLATION_FAILED':
              versionUpdate.latestAngularHash = versionEvent.version.hash;
              versionUpdate.errorMessage = versionEvent.error;
              break;
            case 'VERSION_READY':
              versionUpdate.latestAngularHash = versionEvent.latestVersion.hash;
              versionUpdate.currentAngularHash = versionEvent.currentVersion.hash;
              break;
            case 'NO_NEW_VERSION_DETECTED':
              versionUpdate.currentAngularHash = versionEvent.version.hash;
              break;
          }

          this.currentAngularHashVersion.update((current: AngularHashVersion) => {
            return {
              ...current,
              ...versionUpdate,
            };
          });
        },
      }),
    );

    this.subscriptions.add(this.swService.unrecoverable.subscribe({
      next: (unrecoverableState: UnrecoverableStateEvent) => {
        this.currentAngularHashVersion.update((current: AngularHashVersion) => {
          return {
            ...current,
            errorMessage: unrecoverableState.reason,
            swEventState: unrecoverableState.type,
          };
        });
      },
    }));
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
