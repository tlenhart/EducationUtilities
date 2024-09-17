import { FormArray, FormControl } from '@angular/forms';

export interface NumberTableConfig {
  start: number;
  end: number;
  columns: number;
  colors: Array<string>;
  showBackgroundColors: boolean;
  showHiddenValues: boolean;

  /**
   * A name to use for default configurations. Display-only property.
   */
  name?: string;
}

export interface NumberFormConfig extends NumberTableConfig {
  countBy: number;
}

export type ColorAlignmentOptions = 'row' | 'column' | 'both';

export interface MultiplicationFormConfig extends NumberTableConfig {
  alignColorsBy: ColorAlignmentOptions;
  showColumnHeaders: boolean;
  showRowHeaders: boolean;
}

export type NumberFormForm = {
  [K in keyof NumberFormConfig as Exclude<K, 'colors'>]: FormControl<NumberFormConfig[K]>;
} & {
  colors: FormArray<FormControl<string>>;
};

export type MultiplicationTableConfigForm = {
  [K in keyof MultiplicationFormConfig as Exclude<K, 'colors' | 'columns'>]: FormControl<MultiplicationFormConfig[K]>;
} & {
  colors: FormArray<FormControl<string>>;
};
