import { KeyValuePipe, NgClass, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { CustomInputComponent, FormErrorMessageComponent, SelectIndustriesComponent } from '@/components';
import { BusinessConfigService } from '@/utils';

import { CreateBankService } from '../../../create-bank.service';

@Component({
  selector: 'app-bank-filters',
  imports: [
    CustomInputComponent,
    SelectIndustriesComponent,
    KeyValuePipe,
    FormErrorMessageComponent,
    ReactiveFormsModule,
    NgOptimizedImage,
    NgClass,
  ],
  templateUrl: './bank-filters.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BankFiltersComponent {
  public readonly form = this.formService.form.controls.step_5;

  constructor(
    public readonly config: BusinessConfigService,
    public readonly formService: CreateBankService,
  ) {}

  public toggleCheckbox(event: any, control: FormControl<string[] | null> | null): void {
    if (control) {
      const value: string[] = control.value ?? [];
      const index = value.indexOf(event.target.value);
      if (index === -1) {
        value.push(event.target.value);
      } else {
        value.splice(index, 1);
      }

      control.setValue(value);
      control.updateValueAndValidity();
    }
  }

  public submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.formService.next();
  }
}
