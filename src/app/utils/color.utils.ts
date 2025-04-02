import { fillArrayFunction } from './number-utils';

export type ColorValues = `#${string}`;

export function buildColorsArray(size: number = 10, currentColors: Array<ColorValues> = defaultColors): Array<ColorValues> {
  if (currentColors.length < defaultColors.length) {
    currentColors.push(...defaultColors.slice(currentColors.length));
  }
  const colors = Array
    .from(fillArrayFunction(randomColor, size - currentColors.length));

  colors.unshift(...currentColors);

  return colors.slice(0, size);
}

export const defaultColors: Array<ColorValues> = [
  '#D4BBDD', '#F6E6E8', '#FBDFA0', '#FFC2C7',
  '#5DD9FB', '#BBD5D2', '#FBE7C6', '#B4F8C8',
  '#A0E7E5', '#ffd8c0', '#FFAEBC', '#EDD1FA',
  '#d5ec86',
  // '#a1dbe5', '#f7d8d9', '#85D2D0'
  // '#9589a9', '#887bb0', '#838BC2'
  // '#2ec5e8', '#d5ec86'
];

export function randomColor(): ColorValues {
  return `#${Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, 'F')}`;
}
