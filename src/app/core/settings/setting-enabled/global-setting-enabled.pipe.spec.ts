import { GlobalSettingEnabledPipe } from './global-setting-enabled.pipe';

describe('SettingEnabledPipe', () => {
  it('create an instance', () => {
    const pipe = new GlobalSettingEnabledPipe();
    expect(pipe).toBeTruthy();
  });
});
