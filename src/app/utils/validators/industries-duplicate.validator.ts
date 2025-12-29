import { AbstractControl, FormArray, ValidationErrors, ValidatorFn } from '@angular/forms';

import { DepositConstraintByIndustry, Industry } from '../../interfaces';

export function duplicateIndustriesValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const industries = (control as FormArray).value as DepositConstraintByIndustry[];

    const flatIds = industries.flatMap((industry) => industry.industry.map((i: Industry) => i.id));

    const uniqueIds = new Set(flatIds);

    return flatIds.length === uniqueIds.size ? null : { DUPLICATE_INDUSTRIES: true };
  };
}
