import { GlobalSettingValue, SettingValue } from '../models';

export function isSettingEnabled<T>(setting?: SettingValue<T>): boolean {
  return setting?.settingEnabled ?? false;
}

export function isSettingEnabledAndTrue<T extends boolean>(setting: SettingValue<T>): boolean {
  return isSettingEnabledAndValue<boolean>(setting, true);
}

export function isSettingEnabledAndValue<T>(setting: SettingValue<T>, matchingValue: T): boolean {
  return isSettingEnabled(setting) && setting.value === matchingValue;
}

export function isGlobalSettingEnabled(settings: GlobalSettingValue): boolean {
  return settings.settingGroupAvailable && isSettingEnabledAndTrue(settings.userEnabledGroup);
}
