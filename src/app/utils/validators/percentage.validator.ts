import { AbstractControl, ValidatorFn } from '@angular/forms';

import { safeFloatSum } from '../function';

export const percentageValidator: ValidatorFn = (control: AbstractControl): { [key: string]: any } | null => {
  const value = control.getRawValue() as { percentage: number }[];

  if (
    safeFloatSum(
      value.map((item) => Number(item.percentage)),
      2,
    ) !== 100
  ) {
    return { INSUFFICIENT_PERCENTAGE: true };
  }

  return null;
};
