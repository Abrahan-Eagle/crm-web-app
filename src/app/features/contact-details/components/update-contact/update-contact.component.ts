import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, Input, OnInit, output, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, mergeMap, of } from 'rxjs';

import { CustomInputComponent, PhoneInputComponent } from '@/components';
import { Contact, Phone, UpdateContact } from '@/interfaces';
import { ContactService } from '@/services';
import {
  BusinessConfigService,
  dateAfterValidator,
  dateBeforeValidator,
  dateValidator,
  emailValidator,
  onlyLettersValidator,
  Permissions,
  UserPermissionsService,
} from '@/utils';

@Component({
  selector: 'app-update-contact',
  imports: [CustomInputComponent, PhoneInputComponent, NgOptimizedImage, ReactiveFormsModule, FormsModule],
  templateUrl: './update-contact.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateContactComponent implements OnInit {
  @Input({ required: true }) contact!: Contact;

  public readonly contactUpdated = output<Contact>();

  public readonly loading = signal(false);

  public readonly permission = Permissions;

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

  minAge = (() => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - this.config.minContactAge);
    return today;
  })();

  maxAge = (() => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - this.config.maxContactAge);
    return today;
  })();

  constructor(
    public readonly businessConfig: BusinessConfigService,
    private readonly config: BusinessConfigService,
    private readonly contactService: ContactService,
    public readonly permissions: UserPermissionsService,
    private _fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.syncForm();
  }

  removeEmail(index: number): void {
    if (index > 0) {
      this.form.controls.emails.removeAt(index);
    }
  }

  public readonly form = this._fb.group({
    first_name: ['', [Validators.required, Validators.maxLength(100), onlyLettersValidator()]],
    last_name: ['', [Validators.required, Validators.maxLength(100), onlyLettersValidator()]],
    birthdate: [
      '',
      [Validators.required, dateValidator(), dateBeforeValidator(this.minAge), dateAfterValidator(this.maxAge)],
    ],
    emails: this._fb.array<
      FormGroup<{
        email: FormControl<string | null>;
      }>
    >([]),
    phones: this._fb.array<
      FormGroup<{
        phone: FormControl<Phone | null>;
      }>
    >([]),
  });

  syncForm(): void {
    const { emails, phones, ...contact } = this.contact;
    this.form.patchValue({
      ...contact,
      birthdate: this.contact.birthdate.split('T')[0],
    });

    emails.forEach((email) => this.addEmail(email));
    phones.forEach((phone) => this.addPhone(phone));
  }

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
    this.form.controls.phones.push(
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
      this.form.controls.phones.removeAt(index);
    }
  }

  public submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const contact: UpdateContact = {
      first_name: this.form.value.first_name!.trim(),
      last_name: this.form.value.last_name!.trim(),
      birthdate: this.form.value.birthdate!,
    };

    if (this.permissions.hasPermission(this.permission.VIEW_FULL_EMAIL)) {
      contact.emails = this.form.value.emails!.map((email) => email.email!.trim().toLowerCase());
    }

    if (this.permissions.hasPermission(this.permission.VIEW_FULL_PHONE)) {
      contact.phones = this.form.value.phones!.map((phone) => phone.phone!);
    }

    of(this.loading.set(true))
      .pipe(mergeMap(() => this.contactService.updateContact(this.contact.id, contact)))
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(() => this.contactUpdated.emit({ ...this.contact, ...contact }));
  }
}
