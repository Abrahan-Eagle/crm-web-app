import { Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { finalize } from 'rxjs';

import { BANK_TYPE, CreateBankForm, DepositConstraintByIndustry, Industry } from '@/interfaces';
import { SearchModel } from '@/models';
import { BankService } from '@/services';
import {
  BusinessConfigService,
  duplicateIndustriesValidator,
  ObjectId,
  onlyLettersValidator,
  onlyNumbersValidator,
  SearchService,
} from '@/utils';

@Injectable({
  providedIn: 'root',
})
export class CreateBankService {
  public readonly steps: string[] = [
    'Basic information',
    'Address',
    'Contact information',
    'Filters 1',
    'Filters 2',
    'Documents',
  ];

  public readonly files = signal<File[]>([]);

  public readonly currentStep = signal(0);

  public readonly submitting = signal(false);

  public readonly created = signal(false);

  public readonly industry = signal<Industry[]>([]);

  public readonly form = this._fb.group({
    step_1: this._fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      bank_type: [BANK_TYPE.LENDER, [Validators.required]],
      manager: ['', [Validators.required, Validators.maxLength(100)]],
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
      contacts: this._fb.array([
        this._fb.group({
          first_name: ['', [Validators.required, onlyLettersValidator()]],
          last_name: ['', [Validators.required, onlyLettersValidator()]],
          emails: this._fb.array<FormGroup<{ email: FormControl<string | null> }>>(
            [
              this._fb.group({
                email: [
                  '',
                  [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)],
                ],
              }),
            ],
            [Validators.required],
          ),
          phones: this._fb.array<FormGroup<{ phone: FormControl<any | null> }>>(
            [this._fb.group({ phone: [null, [Validators.required]] })],
            [Validators.required],
          ),
        }),
      ]),
    }),
    step_4: this._fb.group({
      classifications: new FormControl<string[]>([], [this.minArrayLength(1)]),
      territories: this._fb.array<
        FormGroup<{
          territory: FormControl<string | null>;
          excluded_states: FormControl<string[]>;
        }>
      >([], [Validators.required]),
      by_industries: this._fb.array([] as DepositConstraintByIndustry[], [duplicateIndustriesValidator()]),
      minimum_deposits_required: [false],
      deposits_minimum_transactions: [0],
      deposits_minimum_amount: [0],
      positions: [[] as number[], [Validators.required, Validators.min(1)]],
      blocked_products: [[] as string[], []],
    }),
    step_5: this._fb.group({
      supported_ids: new FormControl<string[]>([], [this.minArrayLength(1)]),
      allowed_industries: new FormControl<Industry[]>([], [Validators.minLength(1)]),
      maximum_negative_days: [0, [Validators.required, Validators.max(31), onlyNumbersValidator()]],
      minimum_daily_balance: [0, [Validators.required, onlyNumbersValidator()]],
      has_loan_limit: [true],
      minimum_loan: [
        this.config.minApplicationAmount,
        [
          Validators.required,
          Validators.min(this.config.minApplicationAmount),
          Validators.max(this.config.maxApplicationAmount),
          onlyNumbersValidator(),
        ],
      ],
      loan_limit: [
        this.config.maxApplicationAmount,
        [
          Validators.required,
          Validators.min(this.config.minApplicationAmount),
          Validators.max(this.config.maxApplicationAmount),
          onlyNumbersValidator(),
        ],
      ],
      minimum_months_in_business: [
        0,
        [Validators.required, Validators.min(1), Validators.max(120), onlyNumbersValidator()],
      ],
    }),
  });

  constructor(
    public readonly _fb: FormBuilder,
    private readonly bankService: BankService,
    public readonly searchService: SearchService,
    public readonly config: BusinessConfigService,
  ) {
    this.form.controls.step_5.controls.has_loan_limit.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((hasLoanLimit) => {
        if (hasLoanLimit) {
          this.form.controls.step_5.controls.loan_limit.setValidators(Validators.required);
        } else {
          this.form.controls.step_5.controls.loan_limit.removeValidators(Validators.required);
        }
      });
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

    this.bankService
      .createBank(this.mapBankForm(), this.files())
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe(() => {
        this.created.set(true);
        this.searchService.search.set(SearchModel.EMPTY);
      });
  }

  private mapBankForm(): CreateBankForm {
    const step1 = this.form.value!.step_1;
    const step2 = this.form.value!.step_2;
    const step3 = this.form.value!.step_3;
    const step4 = this.form.value!.step_4;
    const step5 = this.form.value!.step_5;

    return {
      id: ObjectId(),
      name: step1!.name!.trim(),
      manager: step1!.manager!.trim(),
      bank_type: step1!.bank_type!,
      address: {
        address_line_1: step2!.address!.address_line_1!.trim(),
        address_line_2: step2!.address?.address_line_2 ?? null,
        country_iso_code_2: step2!.address!.country.code.trim(),
        state: step2!.address!.state.code.trim(),
        city: step2!.address!.city.trim(),
        zip_code: step2!.address!.zip_code.trim(),
      },
      contacts: step3!.contacts!.map((contact) => ({
        first_name: contact!.first_name!.trim(),
        last_name: contact!.last_name!.trim(),
        emails: contact!.emails!.map((email) => email!.email!.trim().toLowerCase()),
        phones: contact!.phones!.map((phone) => phone.phone),
      })),
      constraints: {
        classifications: step4!.classifications!,
        territories: step4!.territories!.map((territory: any) => ({
          territory: territory.territory.trim(),
          excluded_states: territory.excluded_states.map((state: any) => state.code.trim()),
        })),
        deposits: step4!.minimum_deposits_required
          ? {
              minimum_amount: Number(step4!.deposits_minimum_amount!),
              minimum_transactions: Number(step4!.deposits_minimum_transactions!),
              by_industries:
                step4?.by_industries?.map((industry: any) => ({
                  industry: industry?.industry!.at(0)!.name,
                  minimum_amount: Number(industry?.minimum_amount),
                  minimum_transactions: Number(industry?.minimum_transactions),
                })) ?? [],
            }
          : null,
        loan_limit: step5?.has_loan_limit ? Number(step5?.loan_limit) : null,
        has_loan_limit: step5?.has_loan_limit,
        minimum_loan: Number(step5?.minimum_loan),
        maximum_negative_days: Number(step5!.maximum_negative_days!),
        minimum_daily_balance: Number(step5!.minimum_daily_balance!),
        minimum_months_in_business: Number(step5!.minimum_months_in_business!),
        allowed_industries: step5!.allowed_industries!.map((industry) => industry.name),
        supported_ids: step5!.supported_ids!,
        positions: step4!.positions! as number[],
        blocked_products: step4!.blocked_products! as string[],
      } as any & { industry: string },
    };
  }

  minArrayLength(length: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value as string[] | null;
      return value && value.length >= length ? null : { minArrayLength: length };
    };
  }

  maxArrayLength(length: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value as string[] | null;
      return value && value.length <= length ? null : { maxArrayLength: length };
    };
  }

  public reset() {
    this.currentStep.set(0);
    this.created.set(false);
    this.form.reset();
  }

  trackIndustry(item: any): any {
    return item!.id!;
  }
}
