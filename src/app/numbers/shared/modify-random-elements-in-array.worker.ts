/// <reference lib="webworker" />

import { FormattedNumberValue } from '../../models';
import { randomIntAboveZero } from '../../utils/random.utils';

addEventListener(
  'message',
  ({ data }: MessageEvent<{
    values: Array<FormattedNumberValue>,
    count: string | number,
  }>) => {
    let count: number;

    if (typeof data.count === 'string') {
      // No value was provided, so pick a random number of elements to randomize.
      if (!data.count) {
        count = randomIntAboveZero(data.values.length);
      } else {
        count = parseInt(data.count, 10);
      }
    } else {
      count = data.count;
    }

    if (isNaN(count)) {
      postMessage(data.values);
      return;
    }

    updateRandomValues(data.values, count);

    postMessage(data.values);
  });

function updateRandomValues(values: Array<FormattedNumberValue>, count: number): void {
  if (count > values.length || count < 0) {
    throw new Error('Too many elements were requested.');
  }

  values
    .map((value, index) => {
      // Reset the checked values so we only end up with `count` checked elements.
      value.checked = false;

      // Return the value and a random factor used to sort (shuffle) the array.
      return { value: value, sort: Math.random(), index: index };
    })
    .sort((a, b) => a.sort - b.sort)
    .map((value) => {
      return { value: value.value, originalIndex: value.index };
    })
    // Take the first `count` elements from the shuffled array. These will be the elements that get checked.
    .splice(0, count)
    // Set the checked value for the selected objects, relying on the object reference to change the value without needing to re-create the array.
    .forEach((value) => {
      value.value.checked = true;
    });
}
