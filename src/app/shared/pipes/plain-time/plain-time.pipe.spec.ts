import { PlainTimePipe } from './plain-time.pipe';

describe('PlainTimePipe', () => {
  it('create an instance', () => {
    const pipe = new PlainTimePipe();
    expect(pipe).toBeTruthy();
  });
});
