import { Pipe, PipeTransform } from '@angular/core';
import { GlobalSettingValue, SettingValue } from '../../../models';
import { isGlobalSettingEnabled, isSettingEnabled } from '../../../utils/setting.utils';

@Pipe({
  name: 'globalSettingEnabled',
  standalone: true,
  pure: true,
})
export class GlobalSettingEnabledPipe implements PipeTransform {

  public transform(setting: GlobalSettingValue, specificSetting?: SettingValue<unknown>): boolean {
    const globalSettingEnabled: boolean = isGlobalSettingEnabled(setting);

    if (!specificSetting) {
      return globalSettingEnabled;
    }

    return globalSettingEnabled && isSettingEnabled(specificSetting);
  }

}
