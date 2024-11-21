import { Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { SidenavStyle } from '../../models/sidenav.model';

@Injectable({
  providedIn: 'root',
})
export class GlobalUIService {

  private shouldAutosizeTimeout?: number;

  public get showAppTitleBar(): Signal<boolean> {
    return this._showAppTitleBar.asReadonly();
  }

  public get style(): Signal<SidenavStyle> {
    return this._sidenavStyle.asReadonly();
  }

  // Use this to toggle autosizing on the sidenav to try and avoid performance implications mentioned here: https://material.angular.io/components/sidenav/overview#resizing-an-open-sidenav.
  // This has the potential to cause problems, so we'll want to keep an eye on it if the UI ever gets real messed up.
  public get autosize(): Signal<boolean> {
    return this._shouldAutosize.asReadonly();
  }

  private readonly _showAppTitleBar: WritableSignal<boolean> = signal(true);

  private readonly _sidenavStyle: WritableSignal<SidenavStyle> = signal('default');
  private readonly _shouldAutosize: WritableSignal<boolean> = signal(false);

  public setGlobalUI(config: Partial<{ showAppTitleBar: boolean, sidenavStyle: SidenavStyle }>): void {
    this._showAppTitleBar.set(config.showAppTitleBar ?? this._showAppTitleBar());

    if (config.sidenavStyle) {
      this.setSidenavStyle(config.sidenavStyle);
    }
  }

  public setAppTitleBarVisibility(show: boolean): void {
    this._showAppTitleBar.set(show);
  }

  public setSlimSidebar(): void {
    this.setSidenavStyle('slim');
  }

  public setDefaultSidebar(): void {
    this.setSidenavStyle('default');
  }

  private setSidenavStyle(sidenavStyle: SidenavStyle): void {
    this._sidenavStyle.set(sidenavStyle);
    this.toggleSetAutosize();
  }

  private toggleSetAutosize(): void {
    this._shouldAutosize.set(true);

    if (this.shouldAutosizeTimeout) {
      self.clearTimeout(this.shouldAutosizeTimeout);
      this.shouldAutosizeTimeout = undefined;
    }

    // After 1.5s of letting autosize remain on, turn it off to try and avoid performance problems.
    this.shouldAutosizeTimeout = self.setTimeout(() => {
      this._shouldAutosize.set(false);
      this.shouldAutosizeTimeout = undefined;
    }, 1500);
  }
}
