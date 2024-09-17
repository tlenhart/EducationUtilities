/**
 * Values, and whether they should be shown/hidden, when printing/displaying the table.
 */
export interface FormattedNumberValue {
  value: number;
  checked?: boolean;
  classList?: Array<string> | string;
  ngStyles?: Record<string, string | number>;
  header?: boolean;
}
