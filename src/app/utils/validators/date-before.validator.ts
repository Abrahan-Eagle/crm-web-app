import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function dateBeforeValidator(maxDate: Date): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const value = control.value;
    const date = new Date(value);

    if (date >= maxDate) {
      return { DATE_BEFORE: maxDate.toISOString().split('T')[0] };
    }

    return null;
  };
}
