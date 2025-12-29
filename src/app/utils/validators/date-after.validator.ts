import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function dateAfterValidator(minDate: Date): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const value = control.value;
    const date = new Date(value);

    if (date <= minDate) {
      return { DATE_BEFORE: minDate.toISOString().split('T')[0] };
    }

    return null;
  };
}
