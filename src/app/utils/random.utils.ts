export function randomIntAboveZero(inclusiveMax: number): number {
  return getRandomNumInRange(1, inclusiveMax);
}

function getRandomNumInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
