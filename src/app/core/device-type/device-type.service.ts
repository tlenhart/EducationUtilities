import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { inject, Injectable } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DeviceTypeService {
  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);

  public readonly isHandset$: Observable<boolean>;

  constructor() {
    this.isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset)
      .pipe(
        map(result => result.matches),
        shareReplay(),
      );
  }
}
