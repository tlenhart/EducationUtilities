import { Pipe, PipeTransform } from '@angular/core';
import { Temporal, Intl as TemporalIntl } from 'temporal-polyfill';

@Pipe({
  name: 'zonedDateTime',
  pure: true,
})
export class ZonedDateTimePipe implements PipeTransform {

  // public transform(value: Temporal.ZonedDateTime, options?: Temporal.ZonedDateTimeToStringOptions): string {
  // public transform(value?: Temporal.ZonedDateTime, options?: Intl.DateTimeFormatOptions, fallback?: string): string {
  public transform(value?: Temporal.ZonedDateTime, formatterOrOptions?: TemporalIntl.DateTimeFormat | Intl.DateTimeFormatOptions, fallback?: string): string {
    if (!value) {
      return fallback ?? '';
    }

    try {
      if (!formatterOrOptions) {
        // Default iso locale formatting.
        return value.toString();
      }

      // TODO: Follow performance guidance from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/ZonedDateTime/toLocaleString#:~:text=Every%20time%20toLocaleString,to%20format().
      if (formatterOrOptions instanceof TemporalIntl.DateTimeFormat) {
        // console.log('instance'); // TODO: Make sure the formatting works correctly when using the class and make sure values are actually being cached. May require using the settings service directly.
        return formatterOrOptions.format(value.toInstant());
      }

      return value.toLocaleString(undefined, formatterOrOptions);
    } catch (e: unknown) {
      console.error('Formatting error', e);

      return 'Error while formatting date time.';
    }
  }

}
