import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { CustomInputComponent, CustomSelectComponent, PhoneInputComponent } from '@/components';
import { Bank, BankContact, Phone } from '@/interfaces';
import { BankService } from '@/services';
import { onlyLettersValidator, Permissions, UserPermissionsService } from '@/utils';

@Component({
  selector: 'app-update-bank-contacts',
  imports: [CustomInputComponent, PhoneInputComponent, ReactiveFormsModule, NgOptimizedImage, CustomSelectComponent],
  templateUrl: './update-bank-contacts.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateBankContactsComponent implements OnInit {
  @Input({ required: true }) bank!: Bank;

  @Output() bankUpdated = new EventEmitter<Bank>();

  public readonly loading = signal(false);

  public readonly permission = Permissions;

  constructor(
    public readonly _fb: FormBuilder,
    private readonly bankService: BankService,
    public readonly permissions: UserPermissionsService,
  ) {}

  ngOnInit(): void {
    this.bank.contacts.forEach((contact) => this.addContact(contact));

    this.form.patchValue({
      name: this.bank.name,
      manager: this.bank.manager,
      bank_type: this.bank.bank_type,
    });
  }

  public readonly form = this._fb.group({
    name: [this.bank?.name, [Validators.required, Validators.maxLength(100)]],
    manager: [this.bank?.manager, [Validators.required, Validators.maxLength(100), onlyLettersValidator()]],
    bank_type: [this.bank?.bank_type, [Validators.required]],
    contacts: this._fb.array<
      FormGroup<{
        first_name: FormControl<string | null>;
        last_name: FormControl<string | null>;
        emails: FormArray<
          FormGroup<{
            email: FormControl<string | null>;
          }>
        >;
        phones: FormArray<
          FormGroup<{
            phone: FormControl<any | null>;
          }>
        >;
      }>
    >([]),
  });

  addContact(contact?: BankContact) {
    this.form.controls.contacts.push(
      this._fb.group({
        first_name: [contact?.first_name ?? '', [Validators.required, onlyLettersValidator()]],
        last_name: [contact?.last_name ?? '', [Validators.required, onlyLettersValidator()]],
        emails: this._fb.array<FormGroup<{ email: FormControl<string | null> }>>([], [Validators.required]),
        phones: this._fb.array<FormGroup<{ phone: FormControl<any | null> }>>([], [Validators.required]),
      }),
    );

    const currentPosition = this.form.controls.contacts.length - 1;

    if (contact && contact?.emails?.length > 0) {
      contact.emails.forEach((email) => this.addEmail(currentPosition, email));
    } else {
      this.addEmail(currentPosition);
    }

    if (contact && contact?.phones?.length > 0) {
      contact.phones.forEach((phone) => this.addPhone(currentPosition, phone));
    } else {
      this.addPhone(currentPosition);
    }
  }

  removeEmail(parent: number, index: number): void {
    if (index > 0) {
      this.form.controls.contacts.at(parent).controls.emails.removeAt(index);
    }
  }

  removePhone(parent: number, index: number): void {
    if (index > 0) {
      this.form.controls.contacts.at(parent).controls.phones.removeAt(index);
    }
  }

  public addEmail(parent: number, email?: string): void {
    this.form.controls.contacts.at(parent).controls.emails.push(
      this._fb.group({
        email: [
          email ?? '',
          [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)],
        ],
      }),
    );
  }

  public addPhone(parent: number, phone?: Phone): void {
    this.form.controls.contacts
      .at(parent)
      .controls.phones.push(this._fb.group({ phone: [phone ?? null, [Validators.required]] }));
  }

  removeContact(index: number) {
    if (index > 0) {
      this.form.controls.contacts.removeAt(index);
    }
  }

  submit(): void {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    const processedContacts = this.form.value.contacts!.map((contact) => ({
      ...contact,
      emails: contact.emails!.map((email) => email.email!.trim()),
      phones: contact.phones!.map((phone) => phone.phone),
    })) as BankContact[];

    this.loading.set(true);

    this.bankService
      .updateBank(this.bank!.id, {
        name: this.form.value.name?.trim() || '',
        manager: this.form.value.manager?.trim() || '',
        bank_type: this.form.value.bank_type!,
        contacts: processedContacts,
      })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(() =>
        this.bankUpdated.emit({
          ...this.bank,
          name: this.form.value.name?.trim() || '',
          manager: this.form.value.manager?.trim() || '',
          bank_type: this.form.value.bank_type!,
          contacts: processedContacts,
        }),
      );
  }
}
