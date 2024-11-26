// import { Provider } from '@angular/core';
// import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDateFormats } from '@angular/material/core';
//
// export const TEMPORAL_DATE_FORMATS: MatDateFormats = {
//   parse: {
//     dateInput: 'T',
//     // timeInput: 't',
//   },
//   display: {
//     dateInput: 'T',
//     // timeInput: 't',
//     monthYearLabel: 'LLL yyyy',
//     dateA11yLabel: 'DD',
//     monthYearA11yLabel: 'DDDD yyyy',
//     monthLabel: 'MM',
//   }
// };
//
// export function provideTemporalDateAdapter(formats: MatDateFormats = ): Array<Provider> {
//   return [
//     {
//       provide: DateAdapter,
//       useClass: TemporalAdapter,
//       deps: [MAT_DATE_LOCALE],
//     },
//     {
//       provide: MAT_DATE_FORMATS,
//       useValue: formats,
//     },
//   ];
// }
