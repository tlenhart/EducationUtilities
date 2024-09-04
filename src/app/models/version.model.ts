export class Version {
  constructor(
    public readonly major: number,
    public readonly minor: number,
    public readonly patch: number) {

    if (isNaN(this.major) || isNaN(this.minor) || isNaN(this.patch)) {
      throw new Error('Invalid version number.');
    }
  }

  public [Symbol.toPrimitive](): string {
    return this.formatVersion();
  }

  public valueOf(): string {
    return this.formatVersion();
  }

  public toString(): string {
    return this.formatVersion();
  }

  private formatVersion(): string {
    return `${this.major}.${this.minor}.${this.patch}`;
  }

  public static parse(version: string): Version {
    const split: Array<string> = version.split('.');

    if (split.length !== 3) {
      throw new Error('Invalid version number');
    }

    const major: number = parseInt(split[0]);
    const minor: number = parseInt(split[1]);
    const patch: number = parseInt(split[2]);

    return new Version(major, minor, patch);
  }
}

export type Versioned<T> = Readonly<T> & { readonly version: Version };
