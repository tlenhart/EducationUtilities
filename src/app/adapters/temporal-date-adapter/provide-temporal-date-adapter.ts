import { EnvironmentProviders, Provider } from '@angular/core';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MAT_NATIVE_DATE_FORMATS,
  MatDateFormats,
} from '@angular/material/core';
import { Temporal } from 'temporal-polyfill';
import { NativeDateAdapter2 } from '../native-date-adapter-2.adapter';
import { TemporalPlainDateTimeAdapter } from './temporal-date.adapter';
import { TemporalPlainTimeAdapter } from './temporal-plaintime.adapter';

const defaultTimeFormat: Temporal.ToStringPrecisionOptions = {
  roundingMode: 'ceil',
  smallestUnit: 'minute',
  fractionalSecondDigits: 0,
};
const defaultTimeParseFormat: Temporal.AssignmentOptions = { overflow: 'constrain' };

export interface TemporalPlainTimeDisplayOptions {
  timeOptionLabel: Temporal.ToStringPrecisionOptions | Intl.DateTimeFormatOptions;
}

export interface TemporalPlainTimeFormats {
  // display: Omit<MatDateFormats['display'], keyof TemporalPlainTimeDisplayOptions> & TemporalPlainTimeDisplayOptions;
  display: Omit<MatDateFormats['display'], keyof TemporalPlainTimeDisplayOptions> | TemporalPlainTimeDisplayOptions;
}

// const x: TemporalPlainTimeFormats = {
//   display: {
//     timeOptionLabel: { hour: '2-digit', minute: '2-digit', second: '2-digit' },
//   },
// };

export type TemporalDateFormats = Omit<MatDateFormats, 'display'> & TemporalPlainTimeFormats;

export const TEMPORAL_DATE_FORMATS: TemporalDateFormats = {
  parse: {
    dateInput: 'T',
    timeInput: defaultTimeParseFormat,
  },
  display: {
    dateInput: 'T',
    // timeInput: defaultTimeFormat,
    timeInput: {
      roundingMode: 'floor',
      fractionalSecondDigits: 2,
      smallestUnit: 'second',
    } as Temporal.ToStringPrecisionOptions,
    monthYearLabel: 'LLL yyyy',
    dateA11yLabel: 'DD',
    monthYearA11yLabel: 'DDDD yyyy',
    monthLabel: 'MM',
    // timeOptionLabel: 'HH:mm',
    // TODO: Type is not set right for timeOptionLabel yet! TemporalPlainTimeFormats
    // timeOptionLabel: { hour: '2-digit', minute: '2-digit', second: '2-digit' } as Intl.DateTimeFormatOptions,
    // timeOptionLabel: { timeStyle: 'full' } as Intl.DateTimeFormatOptions,
    timeOptionLabel: {
      roundingMode: 'floor',
      fractionalSecondDigits: 2,
      smallestUnit: 'second',
    } as Temporal.ToStringPrecisionOptions,
  },
};

export function provideTemporalPlainDateTimeAdapter(formats: TemporalDateFormats = TEMPORAL_DATE_FORMATS): ReadonlyArray<Provider | EnvironmentProviders> {
  return [
    {
      provide: DateAdapter,
      useClass: TemporalPlainDateTimeAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: formats,
    },
  ];
}

// ? Use TEMPORAL_DATE_FORMATS for both?
export function provideTemporalPlainTimeAdapter(formats: TemporalDateFormats = TEMPORAL_DATE_FORMATS): Array<Provider | EnvironmentProviders> {
  return [
    {
      provide: DateAdapter,
      useClass: TemporalPlainTimeAdapter,
      deps: [MAT_DATE_LOCALE],
      // multi: true,
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: formats,
      // multi: true,
    },
  ];
}

export function provideNativeDateAdapter2(
  formats: MatDateFormats = MAT_NATIVE_DATE_FORMATS,
): Array<Provider> {
  return [
    { provide: DateAdapter, useClass: NativeDateAdapter2, multi: true },
    { provide: MAT_DATE_FORMATS, useValue: formats, multi: true },
  ];
}
