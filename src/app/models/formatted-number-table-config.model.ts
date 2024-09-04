import { FormattedNumberValue } from './formatted-number-value.model';
import { NumberFormConfig } from './forms.types';

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
   * Whether or not hidden values should be shown in the editor before printing.
   */
  showHiddenValues: boolean;

  constructor(initialConfig?: Partial<FormattedNumberTableConfig>) {
    this.values = Array.isArray(initialConfig?.values) ? initialConfig.values : [];
    this.columns = initialConfig?.columns ?? 10;
    this.colors = Array.isArray(initialConfig?.colors) ? initialConfig.colors : [];
    this.showHiddenValues = initialConfig?.showHiddenValues ?? false;
  }

  public static fromNumberFormConfig(numberFormConfig: NumberFormConfig, values: Array<FormattedNumberValue>): FormattedNumberTableConfig {
    return new FormattedNumberTableConfig({
      values: values,
      colors: numberFormConfig.colors,
      columns: numberFormConfig.columns,
      showHiddenValues: numberFormConfig.showHiddenValues,
    });
  }
}

