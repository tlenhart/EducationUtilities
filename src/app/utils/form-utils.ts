import { FormControl, FormControlState, NonNullableFormBuilder } from '@angular/forms';
import { GlobalSettingValue, SettingValue } from '../models';

/**
 * Take an array of data, and convert it to an array of typed form controls containing that data.
 * @template T - The type of data to use for the form control. Ex. number, string, boolean.
 * @param {Array<T>} values - The values to create form controls for.
 * @param {NonNullableFormBuilder} fb - The form builder to use to create the controls.
 * @returns {Array<FormControl<T>>} - An array of form controls containing the provided values.
 */
export function arrayToArrayOfFormControls<T>(values: Array<T>, fb: NonNullableFormBuilder): Array<FormControl<T>> {
  return values.map((value: T) => fb.control<T>(value));
}

/**
 * Build the data provided to a form control builder using the provided SettingValue.
 *
 * This will specify the form control value and whether the form control should be disabled.
 * @template T The type contained within the SettingValue.
 * @param {SettingValue<T>} settingValue - The setting to get the value and enabled status from.
 * @returns {FormControlState<T>} - The data to provide to a form control builder.
 */
export function buildIndividualFormControlData<T>(settingValue: SettingValue<T>): FormControlState<T> {
  return { value: settingValue.value, disabled: !settingValue.settingEnabled };
}

/**
 * Build the initial data/configuration for a form control using a provided SettingValue and GlobalSettingValue.
 *
 * The GlobalSettingValue is used to help determine if the control should be disabled.
 * @template T - The type of data being set in the form control.
 * @param {SettingValue<T>} settingValue - Contains the value to put in the form control, and whether the setting is enabled.
 * @param {GlobalSettingValue} baseSettings - Contains settings for the global setting section. Used to help determine if the control should be disabled.
 * @returns {FormControlState<T>} - The constructed data to provide to the form control builder.
 */
export function buildFormControlDefaults<T>(settingValue: SettingValue<T>, baseSettings: GlobalSettingValue): FormControlState<T> {
  const defaults = buildIndividualFormControlData<T>(settingValue);
  defaults.disabled ||= !baseSettings.userEnabledGroup.value;
  return defaults;
}
