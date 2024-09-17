import { ColorAlignmentOptions, MultiplicationFormConfig, NumberFormConfig } from '../models/forms.types';
import { buildColorsArray } from '../utils/color.utils';
import { calculateColumnsForMultiplicationTable } from '../utils/number-utils';

export const NUMBER_TABLE_DEFAULT_CONFIGS: Array<Required<NumberFormConfig>> = [
  buildNumberFormConfig(1, 100, 1, 10),
];

export const MULTIPLICATION_TABLE_DEFAULT_CONFIGS: Array<Required<MultiplicationFormConfig>> = [
  buildMultiplicationFormConfig(1, 12, 'both', true),
];

function buildNumberFormConfig(start: number, end: number, countBy: number, columns: number): Required<NumberFormConfig> {
  return {
    start: start,
    end: end,
    countBy: countBy,
    columns: columns,
    colors: buildColorsArray(columns), // TODO: We should find some way to make this lazy so it doesn't need to be computed up front and take up memory for default values.
    showBackgroundColors: true,
    showHiddenValues: false,
    name: `${start} - ${end} | ${columns} Columns | Count By ${countBy}`,
  };
}

function buildMultiplicationFormConfig(start: number, end: number, alignColorsBy: ColorAlignmentOptions, showHeaders: boolean): Required<MultiplicationFormConfig> {
  const columns: number = calculateColumnsForMultiplicationTable(start, end);
  return {
    start: start,
    end: end,
    columns: columns,
    colors: buildColorsArray(columns), // TODO: We should find some way to make this lazy so it doesn't need to be computed up front and take up memory for default values.
    showBackgroundColors: true,
    alignColorsBy: alignColorsBy,
    showColumnHeaders: showHeaders,
    showRowHeaders: showHeaders,
    showHiddenValues: false,
    name: `${start} - ${end} | ${alignColorsBy ? `Align Colors by ${alignColorsBy}` : ''}`,
  };
}
