import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { AddressFormComponent } from '@/components';
import { CreateBankService } from '@/features/create-bank';

@Component({
  selector: 'app-bank-address',
  imports: [AddressFormComponent, ReactiveFormsModule, NgOptimizedImage],
  templateUrl: './bank-address.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BankAddressComponent {
  public readonly form = this.formService.form.controls.step_2;

  constructor(public readonly formService: CreateBankService) {}

  public submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.formService.next();
  }
}
