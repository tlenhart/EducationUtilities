import { GlobalSettingValue, SettingValue } from '../models';

export function isSettingEnabled<T>(setting: SettingValue<T>): boolean {
  return setting?.settingEnabled ?? false;
}

export function isSettingEnabledAndTrue<T extends boolean>(setting: SettingValue<T>): boolean {
  return isSettingEnabled(setting) && setting.value;
}

export function isGlobalSettingEnabled(settings: GlobalSettingValue): boolean {
  return settings.settingGroupAvailable && isSettingEnabledAndTrue(settings.userEnabledGroup);
}
