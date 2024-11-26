import { inject, Injectable } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { Temporal } from 'temporal-polyfill';

@Injectable()
export class TemporalPlainDateTimeAdapter extends DateAdapter<Temporal.PlainDateTime> {

  private readonly _resolvedIntlNumberFormatOptions = new Intl.NumberFormat().resolvedOptions();

  private readonly _resolvedIntlDateTimeFormatOptions = new Intl.DateTimeFormat().resolvedOptions();

  constructor() {
    super();

    const locale = inject(MAT_DATE_LOCALE, { optional: true });

    this.setLocale(locale || this._resolvedIntlNumberFormatOptions.locale);
  }

  public override getYear(date: Temporal.PlainDateTime): number {
    // Temporal.PlainDateTime.from('2021-11-01T00:00:00.000Z');
    return date.year;
  }

  public override getMonth(date: Temporal.PlainDateTime): number {
    return date.month - 1; // TODO: May need to subtract 1.
  }

  public override getDate(date: Temporal.PlainDateTime): number {
    return date.day;
  }

  public override getDayOfWeek(date: Temporal.PlainDateTime): number {
    if (date.dayOfWeek === 7) {
      return 0;
    }

    return date.dayOfWeek;
  }

  public override getMonthNames(style: 'long' | 'short' | 'narrow'): Array<string> {
    const monthNames: Array<string> = [];

    for (let i = 1; i <= 12; i++) {
      const yearMonth = Temporal.PlainYearMonth.from({ year: 2019, month: i, calendar: this._resolvedIntlDateTimeFormatOptions.calendar });
      monthNames.push(yearMonth.toLocaleString(this.locale as string, { month: style, calendar: this._resolvedIntlDateTimeFormatOptions.calendar }));
    }

    return monthNames;
  }

  public override getDateNames(): Array<string> {
    const dateNames: Array<string> = [];
    const format = new Intl.DateTimeFormat(this.locale as string, { day: 'numeric', timeZone: 'utc' });

    for (let i = 1; i < 32; i++) {
      const temporalDate = Temporal.Instant.from(`2019-01-${i.toString().padStart(2, '0')}T00:00:00.000Z`);
      dateNames.push(format.format(temporalDate.epochMilliseconds));
    }

    return dateNames;
  }

  public override getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): Array<string> {
    const weekDateNames: Array<string> = [];
    const format = new Intl.DateTimeFormat(this.locale as string, { weekday: style, timeZone: 'utc' });

    for (let i = 1; i < 8; i++) {
      // 2019-09-01 is a week where the first date (01) is on Sunday.
      const temporalDate = Temporal.Instant.from(`2019-09-${i.toString().padStart(2, '0')}T00:00:00.000Z`);
      weekDateNames.push(format.format(temporalDate.epochMilliseconds));
    }

    return weekDateNames;
  }

  public override getYearName(date: Temporal.PlainDateTime): string {
    // const format = new Intl.DateTimeFormat(this.locale as string, { year: 'numeric', timeZone: 'utc' });
    return date.year.toString().padStart(4, '0');
  }

  public override getFirstDayOfWeek(): number {
    return 0; // TODO: May not always work...
  }

  public override getNumDaysInMonth(date: Temporal.PlainDateTime): number {
    return date.daysInMonth;
  }

  public override clone(date: Temporal.PlainDateTime): Temporal.PlainDateTime {
    return Temporal.PlainDateTime.from(date);
  }

  public override createDate(year: number, month: number, date: number): Temporal.PlainDateTime {
    return Temporal.PlainDateTime.from({ year, month, day: date });
  }

  public override today(): Temporal.PlainDateTime {
    return Temporal.Now.plainDateTimeISO();
  }

  public override parse(value: unknown, parseFormat: unknown): Temporal.PlainDateTime | null {
    throw new Error('Method not implemented.');
  }

  public override format(date: Temporal.PlainDateTime, displayFormat: unknown): string {
    throw new Error('Method not implemented.');
  }

  public override addCalendarYears(date: Temporal.PlainDateTime, years: number): Temporal.PlainDateTime {
    return date.add({ years });
  }

  public override addCalendarMonths(date: Temporal.PlainDateTime, months: number): Temporal.PlainDateTime {
    return date.add({ months });
  }

  public override addCalendarDays(date: Temporal.PlainDateTime, days: number): Temporal.PlainDateTime {
    return date.add({ days });
  }

  public override toIso8601(date: Temporal.PlainDateTime): string {
    return date.toString();
  }

  public override isDateInstance(obj: unknown): boolean {
    return obj instanceof Temporal.PlainDateTime;
  }

  public override isValid(date: Temporal.PlainDateTime): boolean {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return !!(date?.toString()); // TODO: Improve this.
  }

  public override invalid(): Temporal.PlainDateTime {
    // Exceptions are thrown when generating invalid PlainDateTimes, so just return a really onld value instead.
    // TODO: Potentially fix.
    return Temporal.PlainDateTime.from('0000-01-01');
  }
}

// export class TemporalPlainTimeAdapter extends DateAdapter<Temporal.PlainTime> {
//   constructor() {
//     super();
//   }
// }
