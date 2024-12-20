import { basicTimeInputRegex } from './time.utils';

describe('time.utils', () => {
  describe('time regex', () => {
    describe('basicTimeInputRegex', () => {
      const testCase: string = '23:19';

      expect(basicTimeInputRegex.test(testCase)).toBe(true);
    });
  });
});
