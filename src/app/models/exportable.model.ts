export interface Exportable {
  exportDb: (tableNames?: Array<string> | 'full') => Promise<boolean>;
}

export function maskProperty<T>(
  property: keyof T,
  prefix: string,
  data: T,
  incrementer: Generator<string, never, string>): void {
  if (data[property]) {
    // TODO: Check for done on the incrementer.
    // @ts-expect-error property is not a valid for data, but it is a keyof data and data[property] should be a string.
    data[property] = `${prefix} ${incrementer.next().value}`;

    // TODO: Make type guard maybe.
    // if (typeof data[property] === 'string') {
    //   data[property] = `${prefix} ${incrementer.next().value}`;
    // }
  }
}
