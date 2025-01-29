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
