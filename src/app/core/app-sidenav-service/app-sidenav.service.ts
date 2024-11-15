import { Injectable, Signal, signal, WritableSignal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AppSidenavService {

  private shouldAutosizeTimeout?: number;

  public get style(): Signal<'default' | 'slim'> {
    return this.sidenavStyle.asReadonly();
  }

  // Use this to toggle autosizing on the sidenav to try and avoid performance implications mentioned here: https://material.angular.io/components/sidenav/overview#resizing-an-open-sidenav.
  // This has the potential to cause problems, so we'll want to keep an eye on it if the UI ever gets real messed up.
  public get autosize(): Signal<boolean> {
    return this.shouldAutosize.asReadonly();
  }

  private readonly sidenavStyle: WritableSignal<'default' | 'slim'> = signal('default');
  private readonly shouldAutosize: WritableSignal<boolean> = signal(false);

  public setSlimSidebar(): void {
    this.sidenavStyle.set('slim');
    this.toggleSetAutosize();
  }

  public setDefaultSidebar(): void {
    this.sidenavStyle.set('default');
    this.toggleSetAutosize();
  }

  private toggleSetAutosize(): void {
    this.shouldAutosize.set(true);

    if (this.shouldAutosizeTimeout) {
      self.clearTimeout(this.shouldAutosizeTimeout);
      this.shouldAutosizeTimeout = undefined;
    }

    // After 1.5s of letting autosize remain on, turn it off to try and avoid performance problems.
    this.shouldAutosizeTimeout = self.setTimeout(() => {
      this.shouldAutosize.set(false);
      this.shouldAutosizeTimeout = undefined;
    }, 1500);
  }
}
