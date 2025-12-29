import { computed, Injectable, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { finalize, map, Observable, of, Subject } from 'rxjs';

import { CreateContactForm } from '@/interfaces';
import { SearchModel } from '@/models';
import { ContactService } from '@/services';
import {
  BusinessConfigService,
  dateAfterValidator,
  dateBeforeValidator,
  dateValidator,
  ObjectId,
  onlyLettersValidator,
  SearchService,
} from '@/utils';

@Injectable({
  providedIn: 'root',
})
export class CreateContactService {
  public readonly files = signal<(File & { docType: string })[]>([]);

  public readonly steps: string[] = ['Basic information', 'Address', 'Note', 'Documents'];

  public readonly currentStep = signal(0);

  public readonly submitting = signal(false);

  public readonly created = signal(false);

  public readonly contactCreated = new Subject<any>();

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

  private readonly _form = this._fb.group({
    step_1: this._fb.group({
      first_name: ['', [Validators.required, onlyLettersValidator(), Validators.maxLength(100)]],
      last_name: ['', [Validators.required, onlyLettersValidator(), Validators.maxLength(100)]],
      birthdate: [
        '',
        [Validators.required, dateValidator(), dateBeforeValidator(this.minAge), dateAfterValidator(this.maxAge)],
      ],
      ssn: [
        '',
        [Validators.required, Validators.pattern(/^\d{3}-\d{2}-\d{4}$/)],
        [
          (control) => {
            return this.checkIfContactExists(control.value).pipe(
              map((result) => (result ? { CONTACT_ALREADY_EXISTS: true } : null)),
            );
          },
        ],
      ],
      emails: this._fb.array<FormGroup<{ email: FormControl<string | null> }>>([], [Validators.required]),
      phones: this._fb.array<FormGroup<{ phone: FormControl<any | null> }>>([], [Validators.required]),
    }),
    step_2: this._fb.group({
      address: [
        { country: { name: 'United State', code: 'US' } } as {
          address_line_1: string;
          address_line_2: string | null;
          country: { name: string; code: string };
          state: { name: string; code: string };
          city: string;
          zip_code: string;
        } | null,
        [Validators.required],
      ],
    }),
    step_3: this._fb.group({
      level: [''],
      description: [''],
    }),
    documents: this._fb.array<FormGroup<{ type: FormControl<string | null>; file: FormControl<File | null> }>>([]),
  });

  public readonly form = computed(() => this._form);

  constructor(
    private readonly _fb: FormBuilder,
    private readonly contactService: ContactService,
    private readonly config: BusinessConfigService,
    private readonly searchService: SearchService,
  ) {
    this._form.controls.documents.addValidators((abstractControl: AbstractControl) => {
      const control = abstractControl.value as typeof this._form.controls.documents.value;
      const files = control.map((control) => control?.file?.name).filter(Boolean);

      return new Set(files).size !== files.length ? { FILE_DUPLICATED: true } : null;
    });

    this._form.controls.documents.addValidators((abstractControl: AbstractControl) => {
      const control = abstractControl.value as typeof this._form.controls.documents.value;
      const files = control.map((control) => (control?.file as File & { docType: string })?.docType).filter(Boolean);

      const counts: Record<string, number> = {};
      const types = Object.keys(this.config.contactFileTypes());

      for (const type of files) {
        if (!types.includes(type!)) continue;
        counts[type!] = (counts[type!] || 0) + 1;
        if (counts[type!] > this.config.contactMaxFilePerType)
          return { CONTACT_MAX_FILE_PER_TYPE: this.config.contactMaxFilePerType };
      }

      return null;
    });
  }

  addFileGroup() {
    this._form.controls.documents.push(
      this._fb.group({
        type: ['', [Validators.required]],
        file: [null as File | null],
      }),
    );
  }

  public prev(): void {
    this.currentStep.set(Math.max(this.currentStep() - 1, 0));
  }

  public next(): void {
    const nextStep = this.currentStep() + 1;
    if (nextStep <= this.steps.length - 1) {
      return this.currentStep.set(nextStep);
    }

    this.submit();
  }

  private submit(): void {
    this.submitting.set(true);
    const contact = this.mapContactForm();

    // Extract typed files from FormArray
    const typedFiles = this._form.controls.documents.value
      .filter((doc) => doc.file && doc.type)
      .map((doc) => {
        const file = doc.file! as File & { docType: string };
        file.docType = doc.type!;
        return file;
      });

    this.contactService
      .createContact(contact, typedFiles)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe(() => {
        this.searchService.search.set(SearchModel.EMPTY);
        this.contactCreated.next(contact);
        return this.created.set(true);
      });
  }

  private mapContactForm(): CreateContactForm {
    const step1 = this._form.value!.step_1;
    const step2 = this._form.value!.step_2;
    const step3 = this._form.value!.step_3;

    const contact = {
      id: ObjectId(),
      first_name: step1!.first_name!.trim(),
      last_name: step1!.last_name!.trim(),
      ssn: step1!.ssn!.trim(),
      address: {
        address_line_1: step2!.address!.address_line_1!.trim(),
        address_line_2: step2!.address?.address_line_2 ?? null,
        country_iso_code_2: step2!.address!.country.code.trim(),
        state: step2!.address!.state.code.trim(),
        city: step2!.address!.city.trim(),
        zip_code: step2!.address!.zip_code.trim(),
      },
      birthdate: step1!.birthdate!,
      emails: step1!.emails!.map((email) => email!.email!.trim().toLowerCase()),
      phones: step1!.phones!.map((phone) => phone.phone),
    };

    if (step3?.description) {
      Object.assign(contact, {
        id: ObjectId(),
        description: step3!.description!.trim(),
        level: step3!.level!.trim(),
      });
    }

    return contact;
  }

  public reset() {
    this.currentStep.set(0);
    this.created.set(false);
    this._form.reset();
  }

  checkIfContactExists(value: string): Observable<boolean> {
    if (!value || value.trim() === '') {
      return of(false);
    }

    return this.contactService
      .searchContacts(SearchModel.EMPTY.copyWith({ search: value, limit: 1 }))
      .pipe(map((response) => response.data.length > 0));
  }
}
