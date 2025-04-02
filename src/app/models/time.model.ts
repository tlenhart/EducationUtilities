import { Temporal } from 'temporal-polyfill';

export type BasicTimeInput = `${number}:${number}`;
export type PlainTimeInput = Temporal.PlainTime | BasicTimeInput;

/**
 * An interval of time.
 *
 * When only a number is provided, this represents that number as the number of seconds.
 * 50 would be equivalent to 50s.
 */
export type TimeInterval = number | `${number}${'s' | 'm' | 'h'}`;

export type PlainDateTimeInput = Parameters<typeof Temporal.PlainDateTime.from>[0]; // Temporal.PlainDateTime | Temporal.PlainDateTimeLike
export type ZonedDateTimeInput = Parameters<typeof Temporal.ZonedDateTime.from>[0]; // Temporal.ZonedDateTime | Temporal.ZonedDateTimeLike
