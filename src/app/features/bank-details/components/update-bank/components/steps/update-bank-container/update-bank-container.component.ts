import { KeyValuePipe, NgClass, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { CustomInputComponent, FormErrorMessageComponent, SelectIndustriesComponent } from '@/components';
import { BusinessConfigService } from '@/utils';

import { UpdateBankService } from '../../../update-bank.service';

@Component({
  selector: 'app-update-bank-container',
  imports: [
    CustomInputComponent,
    SelectIndustriesComponent,
    FormErrorMessageComponent,
    ReactiveFormsModule,
    KeyValuePipe,
    NgOptimizedImage,
    NgClass,
  ],
  templateUrl: './update-bank-container.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateBankContainerComponent {
  public readonly form = this.updateBank.form.controls.step_2;

  constructor(
    public readonly config: BusinessConfigService,
    public readonly updateBank: UpdateBankService,
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

    this.updateBank.next();
  }
}
