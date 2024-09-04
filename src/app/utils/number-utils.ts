import { FormattedNumberValue } from '../models';

export function* sequentialNumberGenerator(initial: number, last: number, countBy: number = 1): Generator<number> {
  while (initial <= last) {
    yield initial;
    initial += countBy;
  }
}

export function* formattedSequentialNumberGenerator(initial: number, last: number, countBy: number = 1): Generator<FormattedNumberValue> {
  while (initial <= last) {
    yield { value: initial, checked: false };
    initial += countBy;
  }
}

export function* fillArray<T>(value: T, count: number): Generator<T> {
  for (let i = 0; i < count; i++) {
    yield value;
  }
}

export function* fillArrayFunction<T>(generator: () => T, count: number): Generator<T> {
  for (let i: number = 0; i < count; i++) {
    yield generator();
  }
}
