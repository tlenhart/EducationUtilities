import { FormArray, FormControl } from '@angular/forms';

export interface NumberFormConfig {
  start: number;
  end: number;
  countBy: number;
  columns: number;
  colors: Array<string>;
  showHiddenValues: boolean;

  /**
   * A name to use for default configurations. Display-only property.
   */
  name?: string;
}

export type NumberFormForm = {
  [K in keyof NumberFormConfig as Exclude<K, 'colors'>]: FormControl<NumberFormConfig[K]>;
} & {
  colors: FormArray<FormControl<string>>;
}
