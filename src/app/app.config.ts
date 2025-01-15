import { provideHttpClient } from '@angular/common/http';
import {
  ApplicationConfig,
  EnvironmentProviders,
  isDevMode,
  provideExperimentalCheckNoChangesForDebug,
  provideExperimentalZonelessChangeDetection,
  Provider,
} from '@angular/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldDefaultOptions } from '@angular/material/form-field';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, TitleStrategy, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';

import { routes } from './app.routes';
import { PageTitleStrategy } from './strategies/page-title.strategy';

/**
 * The primary application configuration.
 * @type {ApplicationConfig}
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // provideZoneChangeDetection({ eventCoalescing: true }),
    provideExperimentalZonelessChangeDetection(),
    provideExperimentalCheckNoChangesForDebug({
      interval: 10_000,
      exhaustive: true,
      // useNgZoneOnStable: true,
    }),
    ...provideRouting(),
    provideAnimationsAsync(),
    ...provideMaterialDefaults(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    provideHttpClient(),
  ],
};

/**
 * Generate an array of providers related to routing for the application configuration.
 * @returns {ReadonlyArray<Provider | EnvironmentProviders>} - Routing providers.
 */
function provideRouting(): ReadonlyArray<Provider | EnvironmentProviders> {
  return [
    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions(),
    ),
    {
      provide: TitleStrategy,
      useClass: PageTitleStrategy,
    },
  ];
}

/**
 * Generate an array of providers for @angular/material that define the defaults for one or more components.
 * @returns {ReadonlyArray<Provider | EnvironmentProviders>} - Default options for one or more @angular/material components.
 */
function provideMaterialDefaults(): ReadonlyArray<Provider | EnvironmentProviders> {
  return [
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
  ];
}
