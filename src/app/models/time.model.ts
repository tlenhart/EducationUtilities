import { Temporal } from 'temporal-polyfill';

export type BasicTimeInput = `${number}:${number}`;
export type PlainTimeInput = Temporal.PlainTime | BasicTimeInput;

export type TimeInterval = number | `${number}${'s' | 'm' | 'h'}`;
