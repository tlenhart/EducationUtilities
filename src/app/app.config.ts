import {
  ApplicationConfig,
  provideExperimentalCheckNoChangesForDebug,
  provideExperimentalZonelessChangeDetection,
  Provider
} from '@angular/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldDefaultOptions } from '@angular/material/form-field';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // provideZoneChangeDetection({ eventCoalescing: true }),
    provideExperimentalZonelessChangeDetection(),
    provideExperimentalCheckNoChangesForDebug({
      interval: 10_000,
      exhaustive: true,
      // useNgZoneOnStable: true,
    }),
    provideRouter(routes),
    provideAnimationsAsync(),
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        appearance: 'outline',
        floatLabel: 'auto',
        hideRequiredMarker: false,
        subscriptSizing: 'fixed',
      } as MatFormFieldDefaultOptions,
      multi: false,
    } as Provider,
  ],
};
