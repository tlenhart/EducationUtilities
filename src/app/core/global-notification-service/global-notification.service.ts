import { effect, EffectRef, inject, Injectable, OnDestroy, signal, WritableSignal } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarConfig,
  MatSnackBarDismiss,
  MatSnackBarRef,
  TextOnlySnackBar,
} from '@angular/material/snack-bar';
import { SwUpdate, VersionEvent } from '@angular/service-worker';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GlobalNotificationService implements OnDestroy {

  private readonly swUpdate: SwUpdate = inject(SwUpdate);
  private readonly snackbar: MatSnackBar = inject(MatSnackBar);

  private readonly subscriptions: Subscription = new Subscription();
  private readonly versionDetectedMessageShown: WritableSignal<boolean> = signal(false);
  private readonly versionDetectedTimeoutComplete: WritableSignal<boolean> = signal(false);
  private readonly newVersionReady: WritableSignal<boolean> = signal(false);
  private readonly newVersionReadyMessageEffectRef?: EffectRef;

  private readonly newVersionDetectedMessageSnackbarConfig: Readonly<MatSnackBarConfig> = {
    horizontalPosition: 'end',
    verticalPosition: 'bottom',
    politeness: 'off',
    duration: 8_000,
  };

  private readonly versionReadyMessageSnackbarConfig: Readonly<MatSnackBarConfig> = {
    horizontalPosition: 'end',
    verticalPosition: 'bottom',
    politeness: 'polite',
    duration: 12_000,
  };

  constructor() {
    this.subscriptions.add(this.swUpdate.versionUpdates.subscribe((versionEvent: VersionEvent) => {
      let snackbarRef: MatSnackBarRef<TextOnlySnackBar> | undefined = undefined;
      switch (versionEvent.type) {
        case 'VERSION_DETECTED':
          snackbarRef = this.snackbar.open('New version detected. Downloading update...', 'OK', this.newVersionDetectedMessageSnackbarConfig);

          snackbarRef.afterDismissed().subscribe((value: MatSnackBarDismiss) => {
            if (value.dismissedByAction) {
              // When the user dismisses the notification, wait before showing the data loaded message.
              setTimeout(() => {
                this.versionDetectedTimeoutComplete.set(true);
              }, 1500);
            } else {
              this.versionDetectedTimeoutComplete.set(true);
            }
          });

          this.versionDetectedMessageShown.set(true);
          break;
        case 'VERSION_INSTALLATION_FAILED':
          console.warn('VERSION_INSTALLATION_FAILED', versionEvent.error);
          break;
        case 'VERSION_READY':
          this.newVersionReady.set(true);
          break;
        case 'NO_NEW_VERSION_DETECTED':
          this.newVersionReadyMessageEffectRef?.destroy();
          break;
      }
    }));

    this.newVersionReadyMessageEffectRef = effect(() => {
      const versionDetectedMessageShown = this.versionDetectedMessageShown();
      const versionDetectedTimeoutComplete = this.versionDetectedTimeoutComplete();
      const newVersionReady = this.newVersionReady();

      if (versionDetectedMessageShown && versionDetectedTimeoutComplete && newVersionReady) {
        const snackbarRef = this.snackbar.open('New version ready. Refresh the page to use the latest version.', 'Refresh', this.versionReadyMessageSnackbarConfig);
        snackbarRef.afterDismissed().subscribe((value: MatSnackBarDismiss) => {
          // Only reload when the user clicked the refresh button.
          if (value.dismissedByAction) {
            window.location.reload();
          }
        });

        // Destroy the effect since we don't need to listen for changes to the version anymore.
        this.newVersionReadyMessageEffectRef?.destroy();
      }
    });
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
