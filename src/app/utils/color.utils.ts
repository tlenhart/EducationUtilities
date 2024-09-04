import { fillArrayFunction } from './number-utils';

export function buildColorsArray(size: number = 10): Array<string> {
  const colors = Array
    .from(fillArrayFunction(() => `#${Math.floor(Math.random() * 100_000_0)}`, size - defaultColors.length));

  colors.unshift(...defaultColors);

  return colors.slice(0, size);
}

export const defaultColors: Array<string> = [
  '#D4BBDD', '#F6E6E8', '#FBDFA0', '#FFC2C7',
  '#5DD9FB', '#BBD5D2', '#FBE7C6', '#B4F8C8',
  '#A0E7E5', '#FFAEBC',
];
