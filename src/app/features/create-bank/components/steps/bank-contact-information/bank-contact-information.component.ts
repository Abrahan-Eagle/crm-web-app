import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { CustomInputComponent, PhoneInputComponent } from '@/components';
import { CreateBankService } from '@/features/create-bank/create-bank.service';
import { onlyLettersValidator } from '@/utils';

@Component({
  selector: 'app-bank-contact-information',
  imports: [CustomInputComponent, ReactiveFormsModule, NgOptimizedImage, PhoneInputComponent],
  templateUrl: './bank-contact-information.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BankContactInformationComponent implements OnInit {
  public readonly form = this.formService.form.controls.step_3;

  constructor(
    public readonly formService: CreateBankService,
    private readonly _fb: FormBuilder,
  ) {}

  public submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.formService.next();
  }

  public addEmail(parent: number): void {
    this.form.controls.contacts.at(parent).controls.emails.push(
      this._fb.group({
        email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
      }),
    );
  }

  public addPhone(parent: number): void {
    this.form.controls.contacts
      .at(parent)
      .controls.phones.push(this._fb.group({ phone: [null, [Validators.required]] }));
  }

  ngOnInit(): void {
    if (this.form.controls.contacts.length === 0) {
      this.addContact();
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

  addContact() {
    this.form.controls.contacts.push(
      this._fb.group({
        first_name: ['', [Validators.required, onlyLettersValidator()]],
        last_name: ['', [Validators.required, onlyLettersValidator()]],
        emails: this._fb.array<FormGroup<{ email: FormControl<string | null> }>>([], [Validators.required]),
        phones: this._fb.array<FormGroup<{ phone: FormControl<any | null> }>>([], [Validators.required]),
      }),
    );

    this.addEmail(this.form.controls.contacts.length - 1);
    this.addPhone(this.form.controls.contacts.length - 1);
  }

  removeContact(index: number) {
    if (index > 0) {
      this.form.controls.contacts.removeAt(index);
    }
  }
}
