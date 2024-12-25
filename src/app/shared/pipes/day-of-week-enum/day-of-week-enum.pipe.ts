import { Pipe, PipeTransform } from '@angular/core';
import {
  TemporalDayOfWeek,
  TemporalDayOfWeekToDayOfWeekMap,
  TemporalDayOfWeekToShortDayOfWeek,
} from '../../../scheduler-base/models/schedule-time.model';

@Pipe({
  name: 'dayOfWeekEnum',
  pure: true,
})
export class DayOfWeekEnumPipe implements PipeTransform {

  public transform(value: TemporalDayOfWeek, short: boolean): string {
    if (short) {
      return TemporalDayOfWeekToShortDayOfWeek[value];
    } else {
      return TemporalDayOfWeekToDayOfWeekMap[value];
    }
  }

}
