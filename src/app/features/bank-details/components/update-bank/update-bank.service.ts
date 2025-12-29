import { EventEmitter, Injectable, signal } from '@angular/core';
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
import { finalize, mergeMap, of } from 'rxjs';

import { BankConstraint, Industry } from '@/interfaces';
import { BankService } from '@/services';
import {
  BusinessConfigService,
  duplicateIndustriesValidator,
  ModalService,
  NotificationService,
  onlyNumbersValidator,
} from '@/utils';

@Injectable({
  providedIn: 'root',
})
export class UpdateBankService {
  public readonly bankUpdated = new EventEmitter<void>();

  public readonly steps: ('Filters 1' | 'Filters 2')[] = ['Filters 1', 'Filters 2'];

  public readonly currentStep = signal(0);

  public readonly submitting = signal(false);

  public readonly created = signal(false);

  public readonly loading = signal(false);

  public readonly id = signal('');

  constructor(
    private readonly _fb: FormBuilder,
    private readonly bankService: BankService,
    private readonly notification: NotificationService,
    private readonly config: BusinessConfigService,
    public modal: ModalService,
  ) {
    this.form.controls.step_2.controls.has_loan_limit.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((hasLoanLimit) => {
        if (hasLoanLimit) {
          this.form.controls.step_2.controls.loan_limit.setValidators(Validators.required);
        } else {
          this.form.controls.step_2.controls.loan_limit.removeValidators(Validators.required);
        }
      });
  }

  public readonly form = this._fb.group({
    step_1: this._fb.group({
      classifications: [[] as string[], [this.minArrayLength(1)]],
      territories: this._fb.array<
        FormGroup<{
          territory: FormControl<string | null>;
          excluded_states: FormControl<string[]>;
        }>
      >([], [Validators.required]),
      by_industries: this._fb.array<any>([], [duplicateIndustriesValidator()]),
      minimum_deposits_required: [false],
      deposits_minimum_transactions: [0],
      deposits_minimum_amount: [0],
      positions: [[] as number[], [Validators.required, Validators.min(1)]],
      blocked_products: [[] as string[], []],
    }),
    step_2: this._fb.group({
      supported_ids: [[] as string[], [this.minArrayLength(1)]],
      allowed_industries: [[] as Industry[], []],
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

  private mapBankForm(): BankConstraint {
    const step1 = this.form.value!.step_1;
    const step2 = this.form.value!.step_2;

    return {
      classifications: step1!.classifications!.map((classification: string) => classification.trim()),
      territories: step1!.territories!.map((territory: any) => ({
        territory: territory.territory.trim(),
        excluded_states: territory.excluded_states.map((state: any) => state.code as string[]),
      })),
      minimum_months_in_business: Number(step2!.minimum_months_in_business),
      minimum_daily_balance: Number(step2!.minimum_daily_balance),
      maximum_negative_days: Number(step2!.maximum_negative_days),
      loan_limit: step2?.has_loan_limit ? Number(step2?.loan_limit) : null,
      has_loan_limit: step2?.has_loan_limit,
      minimum_loan: step2?.minimum_loan,
      allowed_industries: step2!.allowed_industries!.map((industry) => industry.name),
      supported_ids: step2!.supported_ids!.map((id: string) => id.trim()),
      deposits: {
        minimum_amount: Number(step1!.deposits_minimum_amount),
        minimum_transactions: Number(step1!.deposits_minimum_transactions),
        by_industries:
          step1!.by_industries?.map((industry: any) => ({
            industry: industry?.industry!.at(0)!.name,
            minimum_amount: Number(industry?.minimum_amount),
            minimum_transactions: Number(industry?.minimum_transactions),
          })) ?? [],
      },
      positions: step1!.positions as number[],
      blocked_products: step1!.blocked_products as string[],
    } as BankConstraint & { allowed_industries: string[] };
  }

  public submit(): void {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    of(this.loading.set(true))
      .pipe(mergeMap(() => this.bankService.updateBank(this.id(), { constraints: this.mapBankForm() })))
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(() => {
        this.bankUpdated.emit();
        this.notification.push({ message: 'Filters updated successfully', type: 'success' });
        this.reset();
      });
  }

  public reset() {
    this.currentStep.set(0);
    this.created.set(false);
    this.modal.closeCurrent();
  }
}
