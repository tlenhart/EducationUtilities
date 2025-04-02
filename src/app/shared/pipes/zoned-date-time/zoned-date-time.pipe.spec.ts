import { ZonedDateTimePipe } from './zoned-date-time.pipe';

describe('ZonedDateTimePipe', () => {
  it('create an instance', () => {
    const pipe = new ZonedDateTimePipe();
    expect(pipe).toBeTruthy();
  });
});
