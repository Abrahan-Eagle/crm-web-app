import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { CustomInputComponent, PhoneInputComponent } from '@/components';
import { CreateContactService } from '@/features/create-contact';
import { BusinessConfigService, emailValidator } from '@/utils';

@Component({
  selector: 'app-contact-basic-information',
  imports: [NgOptimizedImage, CustomInputComponent, ReactiveFormsModule, PhoneInputComponent],
  templateUrl: './contact-basic-information.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactBasicInformationComponent implements OnInit {
  public readonly form = this.formService.form().controls.step_1;

  minBirthdateDate = computed(() => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - this.businessConfig.maxContactAge);
    return today.toISOString().split('T')[0];
  });

  maxBirthdateDate = computed(() => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - this.businessConfig.minContactAge);
    return today.toISOString().split('T')[0];
  });

  constructor(
    public readonly formService: CreateContactService,
    public readonly businessConfig: BusinessConfigService,
    private _fb: FormBuilder,
  ) {}

  public submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.formService.next();
  }

  public addEmail(): void {
    this.form.controls.emails.push(
      this._fb.group({
        email: ['', [Validators.required, emailValidator()]],
      }),
    );
  }

  public addPhone(): void {
    this.form.controls.phones.push(this._fb.group({ phone: [null, [Validators.required]] }));
  }

  ngOnInit(): void {
    if (this.form.controls.emails.length === 0) {
      this.addEmail();
    }

    if (this.form.controls.phones.length === 0) {
      this.addPhone();
    }
  }

  removeEmail(index: number): void {
    if (index > 0) {
      this.form.controls.emails.removeAt(index);
    }
  }

  removePhone(index: number): void {
    if (index > 0) {
      this.form.controls.phones.removeAt(index);
    }
  }
}
