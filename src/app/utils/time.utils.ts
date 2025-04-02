// export const basicTimeInputRegex: RegExp = /^\d{2}:\d{2}$/; // TODO: Doesn't handle 0 - 23 changes or am/pm (if needed.)
import { Temporal } from 'temporal-polyfill';
import { PlainDateTimeInput, PlainTimeInput, TimeInterval, ZonedDateTimeInput } from '../models/time.model';

export const basicTimeInputRegex: RegExp = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/; // Time is always done in 24-hour format. https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/time#time_value_format
// export const basicTimeInputRegex: RegExp = /^([0-1][0-9]|2[0-3]):([0-5][0-9]) ?([ap]\.?m\.?)?$/; // TODO: Doesn't handle am/pm (if needed.)
// /^[0-1][0-9]|2[0-3]$/

export function* generateTemporalRange(start: PlainTimeInput, end: PlainTimeInput, interval: TimeInterval): Generator<Temporal.PlainTime> {
  const startTime: Temporal.PlainTime = toPlainTime(start);
  const endTime: Temporal.PlainTime = toPlainTime(end);
  const duration = toDurationLike(interval);

  if (Temporal.PlainTime.compare(startTime, endTime) > 0) {
    throw new Error('StartTime must be less than or equal to EndTime.');
  }

  let current = Temporal.PlainTime.from(startTime);
  while (Temporal.PlainTime.compare(current, endTime) < 1) {
    yield current;
    current = current.add(duration);
  }
}

export function toPlainTime(time: PlainTimeInput): Temporal.PlainTime {
  if (time instanceof Temporal.PlainTime) {
    return time;
  }

  // TODO: Do regex check if necessary. (Might be necessary.)
  return Temporal.PlainTime.from(time);
}

export function toTemporalPlainDateTime(dateTime: PlainDateTimeInput): Temporal.PlainDateTime {
  if (dateTime instanceof Temporal.PlainDateTime) {
    return dateTime;
  }

  return Temporal.PlainDateTime.from(dateTime);
}

export function toTemporalZonedDateTime(dateTime: ZonedDateTimeInput): Temporal.ZonedDateTime {
  if (dateTime instanceof Temporal.ZonedDateTime) {
    return dateTime;
  }

  return Temporal.ZonedDateTime.from(dateTime);
}

export function toDurationLike(interval: TimeInterval | undefined): Temporal.DurationLike {
  if (interval === undefined) {
    return { seconds: 0 };
  }

  if (typeof interval === 'number') {
    return { seconds: interval };
  }

  // TODO: Add bounds and regex check for correct formatting.
  const units = interval.at(-1) ?? '';
  const total = interval.slice(0, interval.length - 1);
  const amount = parseInt(total, 10);

  switch (units) {
    case ('s'): {
      return { seconds: amount };
    }
    case ('m'): {
      return { minutes: amount };
    }
    case ('h'): {
      return { hours: amount };
    }
    default: {
      throw new Error(`Invalid time interval. ${interval}`);
    }
  }
}
