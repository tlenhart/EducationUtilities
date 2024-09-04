import { NumberFormConfig } from '../models/forms.types';
import { buildColorsArray } from '../utils/color.utils';

export const NUMBER_TABLE_DEFAULT_CONFIGS: Array<Required<NumberFormConfig>> = [
  buildNumberFormConfig(1, 100, 1, 10),
];

function buildNumberFormConfig(start: number, end: number, countBy: number, columns: number): Required<NumberFormConfig> {
  return {
    start: start,
    end: end,
    countBy: countBy,
    columns: columns,
    colors: buildColorsArray(columns), // TODO: We should find some way to make this lazy so it doesn't need to be computed up front and take up memory for default values.
    showHiddenValues: false,
    name: `${start} - ${end} | ${columns} Columns | Count By ${countBy}`,
  };
}
