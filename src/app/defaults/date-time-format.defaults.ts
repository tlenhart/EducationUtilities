export type IntlDateTimeFormatOptions = {
  [K in keyof Intl.DateTimeFormatOptions]?: ReadonlyArray<Intl.DateTimeFormatOptions[K]>;
};

export const DateTimeFormatDefaults: IntlDateTimeFormatOptions = {
  localeMatcher: ['lookup', 'best fit'],
  weekday: ['narrow', 'short', 'long'],
  era: ['narrow', 'short', 'long'],
  year: ['2-digit', 'numeric'],
  month: ['narrow', 'short', 'long', '2-digit', 'numeric'],
  day: ['2-digit', 'numeric'],
  hour: ['2-digit', 'numeric'],
  minute: ['2-digit', 'numeric'],
  second: ['2-digit', 'numeric'],
  timeZoneName: ['longGeneric', 'shortGeneric', 'longOffset', 'shortOffset', 'long', 'short'],
  formatMatcher: ['basic', 'best fit'],
  hour12: [false, true],
  dayPeriod: ['long', 'short', 'narrow'],
  dateStyle: ['short', 'medium', 'long', 'full'],
  timeStyle: ['short', 'medium', 'long', 'full'],
  hourCycle: ['h24', 'h23', 'h12', 'h11'],
  fractionalSecondDigits: [3, 2, 1],
  // timeZone: undefined,
  // calendar: undefined,
  // numberingSystem: undefined,
} as const;
