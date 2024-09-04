import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { NumberFormConfig, NumberFormForm } from '../models/forms.types';
import { VALIDATION_ERROR_KEYS } from './validator-error-keys';

export function numberTableConfigValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!isNumberFormGroup(control)) {
      return { [VALIDATION_ERROR_KEYS.invalidFormType]: 'Invalid form type.' };
    }

    const formControls: NumberFormConfig = control.getRawValue();

    // countBy cannot be 0.
    if (!formControls.countBy) {
      return { [VALIDATION_ERROR_KEYS.countBy]: formControls.countBy === 0 ? 'Count By cannot be 0.' : `'Count By' is required.` };
    }
    // Check to see if countBy is negative, and if it is, start must be > end.
    if (formControls.countBy < 0 && formControls.start <= formControls.end) {
      return { [VALIDATION_ERROR_KEYS.countBy]: 'When Count By is negative, Start must be greater than End.' };
    }

    return null;
  }
}

function isNumberFormGroup(control: AbstractControl): control is FormGroup<NumberFormForm> {
  // TODO: May want other checks here, for example a form control in the group,
  //   as this doesn't currently check the specifics on the form group.
  return control instanceof FormGroup;
}
