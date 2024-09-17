import { calculateColumnsForMultiplicationTable } from '../utils/number-utils';
import { FormattedNumberValue } from './formatted-number-value.model';
import { ColorAlignmentOptions, MultiplicationFormConfig, NumberTableConfig } from './forms.types';

/**
 * Configuration for {@link FormattedNumberTableComponent}.
 */
export class FormattedNumberTableConfig {
  /**
   * The values to display in the table.
   */
  values: Array<FormattedNumberValue>;

  /**
   * The number of columns to display in the table.
   */
  columns: number; // TODO: Config like this might best make sense stored in the component itself, rather than passed in.
  // TODO: Although, that has the downside of separating the config into multiple places...

  /**
   * The colors to display for each of the columns.
   * Length should be the same as the number of {@link columns}.
   */
  colors: Array<string>; // TODO: Should be one per column.

  /**
   * Whether the background colors should be displayed in the UI.
   * @type {boolean}
   */
  showBackgroundColors: boolean;

  /**
   * Whether or not hidden values should be shown in the editor before printing.
   */
  showHiddenValues: boolean;

  /**
   * Whether numbers should be colored by rows/columns/both.
   *
   * This should align with any header color.
   * @type {ColorAlignmentOptions}
   */
  alignColorsBy: ColorAlignmentOptions;

  /**
   * Show the headers for the columns, stating the associated number.
   * @type {boolean}
   */
  showColumnHeaders: boolean;

  /**
   * Show the headers for the rows, stating the associated number.
   * @type {boolean}
   */
  showRowHeaders: boolean;

  constructor(initialConfig?: Partial<FormattedNumberTableConfig>) {
    this.values = Array.isArray(initialConfig?.values) ? initialConfig.values : [];
    this.columns = initialConfig?.columns ?? 10;
    this.colors = Array.isArray(initialConfig?.colors) ? initialConfig.colors : [];
    this.showBackgroundColors = initialConfig?.showBackgroundColors ?? false;
    this.showHiddenValues = initialConfig?.showHiddenValues ?? false;
    this.alignColorsBy = initialConfig?.alignColorsBy ?? 'column';
    this.showColumnHeaders = initialConfig?.showColumnHeaders ?? false;
    this.showRowHeaders = initialConfig?.showRowHeaders ?? false;
  }

  public static fromNumberFormConfig(numberFormConfig: NumberTableConfig, values: Array<FormattedNumberValue>): FormattedNumberTableConfig {
    return new FormattedNumberTableConfig({
      values: values,
      colors: numberFormConfig.colors,
      showBackgroundColors: numberFormConfig.showBackgroundColors,
      columns: numberFormConfig.columns,
      showHiddenValues: numberFormConfig.showHiddenValues,
    });
  }

  public static fromMultiplicationFormConfig(config: MultiplicationFormConfig, values: Array<FormattedNumberValue>): FormattedNumberTableConfig {
    const columnCount: number = calculateColumnsForMultiplicationTable(config.start, config.end);

    return new FormattedNumberTableConfig({
      values: values,
      colors: config.colors.slice(0, columnCount), // ?
      showBackgroundColors: config.showBackgroundColors,
      columns: columnCount,
      showHiddenValues: config.showHiddenValues,
      alignColorsBy: config.alignColorsBy,
      showColumnHeaders: config.showColumnHeaders,
      showRowHeaders: config.showRowHeaders,
    });
  }
}

