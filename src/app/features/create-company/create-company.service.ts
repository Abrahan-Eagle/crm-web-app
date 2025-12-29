import { computed, Injectable, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { finalize, map, Observable, of } from 'rxjs';

import { CreateOrUpdateCompanyForm, Industry, MemberDraft } from '@/interfaces';
import { SearchModel } from '@/models';
import { CompanyService } from '@/services';
import { BusinessConfigService, dateValidator, ObjectId, percentageValidator } from '@/utils';

@Injectable({
  providedIn: 'root',
})
export class CreateCompanyService {
  public readonly steps: string[] = ['Business details', 'Members', 'Note', 'Documents'];

  public readonly files = signal<(File & { docType?: string })[]>([]);

  public readonly currentStep = signal(0);

  public readonly submitting = signal(false);

  public readonly created = signal(false);

  private readonly _form = this._fb.group({
    step_1: this._fb.group({
      name: ['', [Validators.required, Validators.maxLength(100), Validators.minLength(2)]],
      dba: [null, [Validators.minLength(2), Validators.maxLength(100)]],
      tax_id: [
        '',
        [Validators.required, Validators.pattern(/^[0-9]{2}-[0-9]{7}$/)],
        [
          (control) => {
            return this.checkIfCompanyExists(control.value).pipe(
              map((result) => (result ? { COMPANY_ALREADY_EXISTS: true } : null)),
            );
          },
        ],
      ],
      industry: [[] as Industry[], [Validators.required, Validators.maxLength(1)]],
      service: ['', [Validators.required, Validators.maxLength(100), Validators.minLength(2)]],
      creation_date: ['', [Validators.required, dateValidator()]],
      entity_type: ['', [Validators.required]],
      phone_numbers: this._fb.array<FormGroup<{ phone: FormControl<any | null> }>>([], [Validators.required]),
      emails: this._fb.array<FormGroup<{ email: FormControl<string | null> }>>([], [Validators.required]),
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
    step_2: this._fb.group({
      members: [[] as MemberDraft[], [Validators.required, percentageValidator]],
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
    private readonly companyService: CompanyService,
    private readonly config: BusinessConfigService,
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
      const types = Object.keys(this.config.companyFileTypes());

      for (const type of files) {
        if (!types.includes(type!)) continue;
        counts[type!] = (counts[type!] || 0) + 1;
        if (counts[type!] > this.config.maxCompanyFilePerType)
          return { COMPANY_MAX_FILE_PER_TYPE: this.config.maxCompanyFilePerType };
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

    // Extract typed files from FormArray
    const typedFiles = this._form.controls.documents.value
      .filter((doc) => doc.file && doc.type)
      .map((doc) => ({ type: doc.type!, file: doc.file! }));

    this.companyService
      .createCompany(this.mapCompanyForm(), typedFiles)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe(() => this.created.set(true));
  }

  private mapCompanyForm(): CreateOrUpdateCompanyForm & { industry: string } {
    const step1 = this._form.value!.step_1;
    const step2 = this._form.value!.step_2;
    const step3 = this._form.value!.step_3;

    const company = {
      id: ObjectId(),
      name: step1!.name!,
      dba: step1?.dba ?? null,
      tax_id: step1!.tax_id!,
      industry: step1!.industry!.at(0)!.name,
      creation_date: step1!.creation_date!,
      entity_type: step1!.entity_type!,
      service: step1!.service!,
      phone_numbers: step1!.phone_numbers!.map((phone) => phone.phone),
      emails: step1!.emails!.map((email) => email!.email!.trim().toLowerCase()),
      address: {
        address_line_1: step1!.address!.address_line_1!.trim(),
        address_line_2: step1!.address!.address_line_2! ?? null,
        country_iso_code_2: step1!.address!.country.code.trim(),
        state: step1!.address!.state.code.trim(),
        city: step1!.address!.city.trim(),
        zip_code: step1!.address!.zip_code.trim(),
      },
      members: step2!.members!.map((member) => ({
        title: member.title,
        percentage: member.percentage,
        member_since: member.member_since,
        contact_id: member.contact?.id,
      })),
    } as CreateOrUpdateCompanyForm & { industry: string };

    if (step3?.description) {
      Object.assign(company, {
        note: {
          id: ObjectId(),
          description: step3!.description!.trim(),
          level: step3!.level!.trim(),
        },
      });
    }

    return company;
  }

  checkIfCompanyExists(value: string): Observable<boolean> {
    if (!value || value.trim() === '') {
      return of(false);
    }

    return this.companyService
      .searchCompanies(SearchModel.EMPTY.copyWith({ search: value, limit: 1 }))
      .pipe(map((response) => response.data.length > 0));
  }
}
