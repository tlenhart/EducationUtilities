import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { computed, inject, Injectable, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, Observable, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DeviceTypeService {
  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);

  public readonly isHandset$: Observable<boolean>;
  private readonly shouldOverlayPanel$: Signal<BreakpointState | undefined>;

  public readonly shouldOverlayRightPanel: Signal<boolean> = computed(() => {
    const overlayPanel = this.shouldOverlayPanel$();

    return overlayPanel?.matches ?? false;
  });

  private readonly isHandsetBreakpoint: string = '(max-width: 664.98px) and (orientation: portrait)';

  constructor() {
    this.isHandset$ = this.breakpointObserver.observe(
      // Breakpoints.Handset
      this.isHandsetBreakpoint,
    ).pipe(
      map(result => result.matches),
      shareReplay(),
    );

    this.shouldOverlayPanel$ = toSignal(this.breakpointObserver.observe([
      this.isHandsetBreakpoint,
    ]));
  }
}
