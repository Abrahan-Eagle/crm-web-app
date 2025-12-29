import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { AddressFormComponent } from '@/components';
import { CreateContactService } from '@/features/create-contact';

@Component({
  selector: 'app-contact-address',
  imports: [AddressFormComponent, ReactiveFormsModule, NgOptimizedImage],
  templateUrl: './contact-address.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactAddressComponent {
  public readonly form = this.formService.form().controls.step_2;

  constructor(public readonly formService: CreateContactService) {}

  public submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.formService.next();
  }
}
