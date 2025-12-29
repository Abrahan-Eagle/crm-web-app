import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { CustomInputComponent, CustomSelectComponent } from '@/components';
import { CreateBankService } from '@/features/create-bank';

@Component({
  selector: 'app-bank-basic-information',
  imports: [NgOptimizedImage, CustomInputComponent, ReactiveFormsModule, CustomSelectComponent],
  templateUrl: './bank-basic-information.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BankBasicInformationComponent {
  public readonly form = this.formService.form.controls.step_1;

  constructor(public readonly formService: CreateBankService) {}

  public submit(): void {
    if (this.formService.form.controls.step_1.invalid) {
      this.formService.form.controls.step_1.markAllAsTouched();
      return;
    }

    this.formService.currentStep.set(this.formService.currentStep() + 1);
  }

  public prev(): void {
    this.formService.currentStep.set(this.formService.currentStep() - 1);
  }
}
