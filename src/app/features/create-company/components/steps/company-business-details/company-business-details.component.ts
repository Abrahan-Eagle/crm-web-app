import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  AddressFormComponent,
  CustomInputComponent,
  CustomSelectComponent,
  PhoneInputComponent,
  SelectIndustriesComponent,
} from '@/components';
import { CreateCompanyService } from '@/features/create-company';
import { BusinessConfigService, emailValidator } from '@/utils';

@Component({
  selector: 'app-company-business-details',
  imports: [
    CustomInputComponent,
    ReactiveFormsModule,
    CustomSelectComponent,
    PhoneInputComponent,
    NgOptimizedImage,
    AddressFormComponent,
    SelectIndustriesComponent,
  ],
  templateUrl: './company-business-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyBusinessDetailsComponent implements OnInit {
  public readonly form = this.formService.form().controls.step_1;

  get maxPhones(): boolean {
    return this.form.controls.phone_numbers.length >= this.config.maxPhoneNumbers;
  }

  get maxEmails(): boolean {
    return this.form.controls.emails.length >= this.config.maxEmails;
  }

  public readonly entityType = computed<{ values: string[]; labels: string[] }>(() => {
    return Object.entries(this.config.entityType()).reduce(
      (prev, [value, key]) => {
        prev.labels.push(key);
        prev.values.push(value);

        return prev;
      },
      { values: [] as string[], labels: [] as string[] },
    );
  });

  maxCreationDate = computed(() => {
    const today = new Date();
    today.setFullYear(today.getFullYear());
    return today.toISOString().split('T')[0];
  });

  constructor(
    public readonly formService: CreateCompanyService,
    private readonly _fb: FormBuilder,
    public readonly config: BusinessConfigService,
  ) {}

  ngOnInit(): void {
    if (this.form.controls.emails.length === 0) {
      this.addEmail();
    }

    if (this.form.controls.phone_numbers.length === 0) {
      this.addPhone();
    }
  }

  public addEmail(): void {
    if (this.maxEmails) {
      return;
    }
    this.form.controls.emails.push(
      this._fb.group({
        email: ['', [Validators.required, emailValidator()]],
      }),
    );
  }

  public addPhone(): void {
    if (this.maxPhones) {
      return;
    }
    this.form.controls.phone_numbers.push(this._fb.group({ phone: [null, [Validators.required]] }));
  }

  removePhone(index: number): void {
    if (index > 0) {
      this.form.controls.phone_numbers.removeAt(index);
    }
  }

  removeEmail(index: number): void {
    if (index > 0) {
      this.form.controls.emails.removeAt(index);
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
