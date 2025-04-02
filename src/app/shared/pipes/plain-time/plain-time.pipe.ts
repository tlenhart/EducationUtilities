import { Pipe, PipeTransform } from '@angular/core';
import { Temporal } from 'temporal-polyfill';

@Pipe({
  name: 'plainTime',
  pure: true,
})
export class PlainTimePipe implements PipeTransform {

  public transform(value: Temporal.PlainTime, showTime: boolean): string {
    if (!showTime) {
      return '';
    }

    return value.toString({ smallestUnit: 'minute' });
  }

}
