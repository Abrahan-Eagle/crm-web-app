import { ChangeDetectionStrategy, Component, Input, OnInit, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, mergeMap, of } from 'rxjs';

import { AddressFormComponent } from '@/components';
import { Contact } from '@/interfaces';
import { ContactService } from '@/services';

@Component({
  selector: 'app-update-contact-address',
  imports: [AddressFormComponent, ReactiveFormsModule],
  templateUrl: './update-address.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateAddressComponent implements OnInit {
  @Input({ required: true }) contact!: Contact;

  public readonly loading = signal(false);

  public readonly contactUpdated = output<Contact>();

  public readonly form = this._fb.group({
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

  constructor(
    private readonly _fb: FormBuilder,
    private readonly contactService: ContactService,
  ) {}

  ngOnInit(): void {
    this.form.controls.address.patchValue({
      ...this.contact.address,
      country: { code: this.contact.address.country_iso_code_2, name: this.contact.address.country_iso_code_2 },
      state: { code: this.contact.address.state, name: this.contact.address.state },
    });
  }

  public submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const address = {
      address_line_1: this.form.value!.address!.address_line_1!.trim(),
      address_line_2: this.form.value!.address?.address_line_2?.trim() ?? null,
      country_iso_code_2: this.form.value!.address!.country.code.trim(),
      state: this.form.value!.address!.state.code.trim(),
      city: this.form.value!.address!.city.trim(),
      zip_code: this.form.value!.address!.zip_code.trim(),
    };

    of(this.loading.set(true))
      .pipe(
        mergeMap(() => this.contactService.updateContact(this.contact.id, { address })),
        finalize(() => this.loading.set(false)),
      )
      .subscribe(() => this.contactUpdated.emit({ ...this.contact, address: { ...address } }));
  }
}
