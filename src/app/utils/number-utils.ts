import { FormattedNumberTableConfig, FormattedNumberValue, GridHeaderType } from '../models';

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

export function* formattedSequentialHeaderNumberGenerator(initial: number, last: number, countBy: number = 1): Generator<FormattedNumberValue> {
  while (initial <= last) {
    yield { value: initial, checked: false, header: true };
    initial += countBy;
  }
}

export function* fillArrayFunction<T>(generator: () => T, count: number): Generator<T> {
  for (let i: number = 0; i < count; i++) {
    yield generator();
  }
}

export function* multiplicationTableNumberGenerator(initial: number, last: number): Generator<FormattedNumberValue> {
  for (let i = initial; i <= last; i++) {
    const genny = formattedSequentialNumberGenerator(i, i * last, i);
    let result: IteratorResult<FormattedNumberValue>;
    do {
      result = genny.next();
      if (!result.done) {
        yield result.value;
      }
    } while (!result.done);
  }
}

export function calculateColumnsForMultiplicationTable(start: number, end: number): number {
  return end - start + 1;
}

export function* configureTableValues(
  config: FormattedNumberTableConfig,
  rowModificationFn: ((config: FormattedNumberTableConfig, item: FormattedNumberValue, index: number) => void) | undefined = undefined): Generator<FormattedNumberValue> {
  if (!Array.isArray(config.values)) {
    return [];
  }

  const numItems: number = config.values.length;
  for (let i = 0; i < numItems; i++) {
    if (rowModificationFn) {
      rowModificationFn(config, config.values[i], i);
    }

    yield config.values[i];
  }
}

export function* configureTableHeaderValues(
  config: FormattedNumberTableConfig,
  type: GridHeaderType,
  rowModificationFn: ((config: FormattedNumberTableConfig, item: FormattedNumberValue, index: number, type: GridHeaderType) => void) | undefined = undefined): Generator<FormattedNumberValue> {
  if (!Array.isArray(config.values)) {
    return [];
  }

  const numItems: number = config.values.length;
  for (let i = 0; i < numItems; i++) {
    if (rowModificationFn) {
      rowModificationFn(config, config.values[i], i, type);
    }

    yield config.values[i];
  }
}

export function setItemClassesAndColors(config: FormattedNumberTableConfig, item: FormattedNumberValue, index: number): void {
  const column: number = index % config.columns;
  const row: number = Math.floor(index / config.columns);

  item.classList = `row${row} column${column}`;

  if (Array.isArray(config.colors) && config.showBackgroundColors) {
    item.ngStyles = {
      'background-color': getBackgroundColor(config, row, column, false),
    }; // TODO: There has to be a better way of doing this.
  } else {
    // item.ngStyles = {
    //   // TODO: Wait, we could just set this once in the css. Maybe make it an empty object here so it doesn't get set when it shouldn't by the previous ngStyles.
    //   'background-color': `var(--mat-app-background-color, #123456)`,
    // };
  }
}

export function setItemClassesAndColorsForHeader(config: FormattedNumberTableConfig, item: FormattedNumberValue, index: number, type: GridHeaderType): void {
  const headerIndex: number = index % config.columns; // currentColumn?
  const row: number = Math.floor(index / config.columns); // Correct name?

  // item.classList = [`row${row}`, `column${column}`];
  // item.classList = [`column${row}`, `row${column}`];
  if (type === 'row') {
    item.classList = `row${headerIndex} row-header on-row-header-column`;
  } else if (type === 'column') {
    item.classList = `column${headerIndex} column-header on-column-header-row`;
  }

  if (Array.isArray(config.colors) && config.showBackgroundColors) {
    item.ngStyles = {
      'background-color': getBackgroundColor(config, row, headerIndex, true),
    }; // TODO: There has to be a better way of doing this.
  } else {
    // item.ngStyles = {
    //   'background-color': `var(--mat-app-background-color, #123456)`,
    // };
  }
}

function getBackgroundColor(config: FormattedNumberTableConfig, row: number, column: number, isHeader: boolean): string {
  switch (config.alignColorsBy) {
    case 'column':
      return config.colors.at(column) ?? 'inherit';
    case 'row':
      if (isHeader) {
        return config.colors.at(column) ?? 'inherit';
      }

      return config.colors.at(row) ?? 'inherit';
    case 'both': {
      if (row > column) {
        return config.colors.at(row) ?? 'inherit';
      }

      return config.colors.at(column) ?? 'inherit';
    }
  }
}
