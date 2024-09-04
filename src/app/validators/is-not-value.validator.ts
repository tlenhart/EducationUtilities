import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { VALIDATION_ERROR_KEYS } from './validator-error-keys';

export function isNotValueValidator<T extends number | string | boolean | bigint | null | undefined | Array<T>>(value: T, errorMessage?: string): ValidatorFn {
  const invalidValueIsArray: boolean = Array.isArray(value);

  return (control: AbstractControl): ValidationErrors | null => {
    const rawValue: T = control.getRawValue();
    if (rawValue === value) {
      return { [VALIDATION_ERROR_KEYS.isNotValue]: errorMessage ? errorMessage : 'Invalid value.' };
    }

    if (invalidValueIsArray && (value as Array<T>).includes(rawValue)) {
      return { [VALIDATION_ERROR_KEYS.isNotValue]: errorMessage ? errorMessage : 'Invalid value.' };
    }

    return null;
  };
}
