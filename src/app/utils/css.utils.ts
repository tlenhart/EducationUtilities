import { UnitSize } from '../models/css-utils.types';

/**
 * Build a string containing the css for setting a width.
 *
 * @param {UnitSize} minWidth - The minimum width for the element. Defaults to `200px`.
 * @param {UnitSize} preferredWidth - The preferred width for the element. Defaults to `400px`.
 * @param {UnitSize} maxWidth - The max width for the element. Defaults to `100vw`.
 * @returns {string} - A CSS `clamp()` string.
 */
export function buildWidthString(minWidth: UnitSize = `200px`, preferredWidth: UnitSize = `400px`, maxWidth: UnitSize = `100vw`): string {
  return `clamp(${minWidth}, ${preferredWidth}, ${maxWidth})`;
}
