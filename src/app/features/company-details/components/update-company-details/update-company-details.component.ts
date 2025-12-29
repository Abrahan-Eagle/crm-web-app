import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, Input, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize, mergeMap, of } from 'rxjs';

import {
  AddressFormComponent,
  CustomInputComponent,
  CustomSelectComponent,
  PhoneInputComponent,
  SelectIndustriesComponent,
} from '@/components';
import { CreateOrUpdateCompanyForm, Industry, Phone } from '@/interfaces';
import { CompanyService } from '@/services';
import { BusinessConfigService, dateValidator, emailValidator, Permissions, UserPermissionsService } from '@/utils';

@Component({
  selector: 'app-update-company-details',
  imports: [
    CustomInputComponent,
    CustomSelectComponent,
    PhoneInputComponent,
    AddressFormComponent,
    RouterLink,
    ReactiveFormsModule,
    NgOptimizedImage,
    FormsModule,
    SelectIndustriesComponent,
  ],
  templateUrl: './update-company-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateCompanyDetailsComponent {
  @Input() set id(value: string) {
    this.companyId.set(value);
    this.setCompanyDetails(value);
  }

  public readonly permission = Permissions;

  public readonly companyId = signal<string>('');

  public readonly loading = signal(false);

  public readonly taxId = signal<string>('');

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

  get maxPhones(): boolean {
    return this.form.controls.phone_numbers.length >= this.config.maxPhoneNumbers;
  }

  get maxEmails(): boolean {
    return this.form.controls.emails.length >= this.config.maxEmails;
  }

  constructor(
    private readonly _fb: FormBuilder,
    public readonly config: BusinessConfigService,
    private readonly companyService: CompanyService,
    public readonly permissions: UserPermissionsService,
    private readonly router: Router,
  ) {}

  public addEmail(email?: string): void {
    this.form.controls.emails.push(
      this._fb.group({
        email: [
          email ?? null,
          this.permissions.hasPermission(this.permission.VIEW_FULL_EMAIL)
            ? [Validators.required, emailValidator()]
            : [],
        ],
      }),
    );
  }

  public addPhone(phone?: Phone): void {
    this.form.controls.phone_numbers.push(
      this._fb.group({
        phone: [
          phone ?? null,
          this.permissions.hasPermission(this.permission.VIEW_FULL_PHONE) ? [Validators.required] : [],
        ],
      }),
    );
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

  public readonly form = this._fb.group({
    company_name: ['', [Validators.required, Validators.maxLength(100)]],
    dba: ['', [Validators.minLength(2), Validators.maxLength(100)]],
    industry: [[] as Industry[], [Validators.required, Validators.maxLength(1)]],
    creation_date: ['', [Validators.required, dateValidator()]],
    entity_type: ['', [Validators.required]],
    service: ['', [Validators.required, Validators.maxLength(100), Validators.minLength(2)]],
    phone_numbers: this._fb.array<
      FormGroup<{
        phone: FormControl<Phone | null>;
      }>
    >([]),
    emails: this._fb.array<
      FormGroup<{
        email: FormControl<string | null>;
      }>
    >([]),
    address: [
      null as {
        address_line_1: string;
        address_line_2: string | null;
        country: { name: string; code: string };
        state: { name: string; code: string };
        city: string;
        zip_code: string;
      } | null,
      [Validators.required],
    ],
  });

  private setCompanyDetails(id: string): void {
    of(this.loading.set(true))
      .pipe(
        mergeMap(() => this.companyService.getCompany(id)),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((company) => {
        this.taxId.set(company.tax_id);
        this.form.patchValue(
          {
            company_name: company.name,
            dba: company.dba ?? null,
            industry: [company.industry],
            creation_date: company.creation_date,
            entity_type: company.entity_type,
            service: company.service,
            address: {
              address_line_1: company.address!.address_line_1!.trim(),
              address_line_2: company.address!.address_line_2! ?? null,
              country: { name: company.address.country_iso_code_2, code: company.address.country_iso_code_2 },
              state: { name: company.address.state, code: company.address.state },
              city: company!.address!.city.trim(),
              zip_code: company!.address!.zip_code.trim(),
            },
          },
          { emitEvent: false },
        );

        company.phone_numbers.forEach((phone) => this.addPhone(phone));
        company.emails.forEach((email) => this.addEmail(email));
      });
  }

  public submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const updateCompany = {
      name: this.form.value.company_name || '',
      dba: this.form.value.dba || null,
      industry: this.form.value.industry!.at(0)!.name,
      creation_date: this.form.value.creation_date || '',
      entity_type: this.form.value.entity_type || '',
      service: this.form.value.service || '',
      address: {
        address_line_1: this.form.value.address!.address_line_1 || '',
        address_line_2: this.form.value.address!.address_line_2 || '',
        country_iso_code_2: this.form.value.address!.country.code || '',
        state: this.form.value.address!.state.code || '',
        city: this.form.value.address!.city || '',
        zip_code: this.form.value.address!.zip_code || '',
      },
    } as CreateOrUpdateCompanyForm & { industry: string };

    if (this.permissions.hasPermission(this.permission.VIEW_FULL_EMAIL)) {
      updateCompany.emails = this.form.value.emails!.map((email) => email.email!.trim().toLowerCase());
    }

    if (this.permissions.hasPermission(this.permission.VIEW_FULL_PHONE)) {
      updateCompany.phone_numbers = this.form.value.phone_numbers!.map((phone) => phone.phone!);
    }

    of(this.loading.set(true))
      .pipe(
        mergeMap(() => this.companyService.updateCompany(this.companyId(), updateCompany)),
        finalize(() => this.loading.set(false)),
      )
      .subscribe(() => this.router.navigate(['/companies', this.companyId()]));
  }
}
