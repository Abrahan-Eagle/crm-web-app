import { Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { finalize, iif, map, mergeMap, of } from 'rxjs';

import { CompanyListItem, DraftDocument } from '@/interfaces';
import { ApplicationsService } from '@/services';
import { appDocumentValidator, BusinessConfigService } from '@/utils';
import { getPreviousPeriods } from '@/utils/function';

@Injectable({
  providedIn: 'root',
})
export class CreateApplicationService {
  public readonly steps: string[] = ['Details', 'Documents', 'Additional Statements'];

  public readonly files = signal<File[]>([]);

  public readonly currentStep = signal(0);

  public readonly submitting = signal(false);

  public readonly created = signal(false);

  constructor(
    public readonly _fb: FormBuilder,
    public readonly config: BusinessConfigService,
    public readonly applicationService: ApplicationsService,
  ) {
    this.form = this._fb.group({
      step_1: this._fb.group({
        loan_amount: [
          0,
          [
            Validators.required,
            Validators.min(this.config.minApplicationAmount),
            Validators.max(this.config.maxApplicationAmount),
            Validators.pattern(/^\d+$/),
          ],
        ],
        product: ['', [Validators.required]],
        referral: this._fb.group({
          source: [''],
          reference: [''],
        }),
        company: [null as null | CompanyListItem, [Validators.required]],
      }),
      step_2: this._fb.group({
        bank_statements: this._fb.array(
          getPreviousPeriods(new Date(), 4).map((period) =>
            this._fb.group({
              statement: [
                {
                  period: period,
                } as null | DraftDocument,
                [appDocumentValidator()],
              ],
            }),
          ),
        ),
      }),
      step_3: this._fb.group({
        mtd_statements: [
          {
            period: getPreviousPeriods(new Date(), 1)[0],
          } as null | DraftDocument,
          [appDocumentValidator()],
        ],
        credit_card_statements: this._fb.array(
          getPreviousPeriods(new Date(), 3).map((period) =>
            this._fb.group({
              statement: [
                {
                  period: period,
                } as null | DraftDocument,
                [appDocumentValidator()],
              ],
            }),
          ),
        ),
        additional_statements: this._fb.array<FormGroup<{ statement: FormControl<any | null> }>>([]),
      }),
    });

    this.form.controls.step_3.controls.mtd_statements.disable();
    this.form.controls.step_3.controls.credit_card_statements.disable();
    this.form.controls.step_3.controls.additional_statements.disable();

    this.form.controls.step_1.controls.company.valueChanges
      .pipe(
        takeUntilDestroyed(),
        mergeMap((company) =>
          iif(
            () => !!company,
            of(company).pipe(
              mergeMap(() => this.applicationService.lastValidPeriod(company!.id)),
              map((previousPeriod) => {
                if (previousPeriod) {
                  return this.calculateRequiredPeriods(previousPeriod, 4);
                }

                return getPreviousPeriods(new Date(), 4);
              }),
            ),
            of(getPreviousPeriods(new Date(), 4)),
          ),
        ),
      )
      .subscribe((periods: string[]) => {
        while (this.form.controls.step_2.controls.bank_statements.length !== 0) {
          this.form.controls.step_2.controls.bank_statements.removeAt(0);
        }

        periods.forEach((period) => {
          this.form.controls.step_2.controls.bank_statements.push(
            this._fb.group({
              statement: [
                {
                  period: period,
                } as null | DraftDocument,
                [appDocumentValidator()],
              ],
            }),
          );
        });

        this.form.controls.step_2.controls.bank_statements.updateValueAndValidity();
      });

    this.form.addValidators((abstractControl: AbstractControl) => {
      const control = abstractControl.value as typeof this.form.value;
      const files = [
        ...(control?.step_2?.bank_statements?.map((control) => control?.statement?.file?.name) ?? []),
        ...(control?.step_3?.additional_statements?.map((control) => control?.statement?.file?.name) ?? []),
        ...(control?.step_3?.credit_card_statements?.map((control) => control?.statement?.file?.name) ?? []),
        control?.step_3?.mtd_statements?.file?.name,
      ].filter(Boolean);

      return new Set(files).size !== files.length ? { FILE_DUPLICATED: true } : null;
    });
  }

  public readonly form;

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
    this.collectFiles();
    this.applicationService
      .createApplication(this.mapApplicationForm(), this.files())
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe(() => this.created.set(true));
  }

  private collectFiles(): void {
    const files: File[] = [];
    const step2 = this.form.value!.step_2;
    const step3 = this.form.value!.step_3;

    step2?.bank_statements?.forEach((statement) => {
      if (statement.statement?.file) {
        files.push(statement.statement.file);
      }
    });

    if (step3?.mtd_statements?.file) {
      files.push(step3.mtd_statements.file);
    }

    step3?.credit_card_statements?.forEach((statement) => {
      if (statement.statement?.file) {
        files.push(statement.statement.file);
      }
    });

    step3?.additional_statements?.forEach((statement) => {
      if (statement.statement?.file) {
        files.push(statement.statement.file);
      }
    });

    this.files.set(files);
  }

  private mapApplicationForm(): any {
    const step1 = this.form.value!.step_1;
    const step2 = this.form.value!.step_2;
    const step3 = this.form.value!.step_3;

    return {
      loan_amount: step1!.loan_amount!,
      product: step1!.product!,
      referral: step1!.referral!.source || step1!.referral!.reference ? step1!.referral : null,
      company_id: step1!.company!.id!,
      bank_statements: step2!.bank_statements!.map((statement) => ({
        amount: statement.statement!.amount,
        transactions: statement.statement!.transactions,
        period: statement.statement!.period,
        name: statement.statement!.file.name,
        negative_days: statement.statement!.negative_days,
      })),
      mtd_statements: step3?.mtd_statements?.file
        ? [
            {
              amount: step3.mtd_statements.amount,
              name: step3.mtd_statements.file.name,
              negative_days: step3.mtd_statements.negative_days,
              transactions: step3.mtd_statements.transactions,
            },
          ]
        : null,

      credit_card_statements: step3?.credit_card_statements
        ? step3.credit_card_statements.map((statement) => ({
            amount: statement.statement?.amount,
            period: statement.statement?.period,
            name: statement.statement?.file.name,
            negative_days: statement.statement?.negative_days,
            transactions: statement.statement?.transactions,
          }))
        : null,

      additional_statements: step3?.additional_statements
        ? step3.additional_statements.map((statement) => ({
            amount: statement.statement?.amount,
            name: statement.statement?.file.name,
            transactions: statement.statement?.transactions,
            negative_days: statement.statement?.negative_days,
          }))
        : null,
    };
  }

  public reset() {
    this.currentStep.set(0);
    this.created.set(false);
    this.form.reset();
  }

  private calculateRequiredPeriods(latestAppPeriod: string, totalPeriods = 4): string[] {
    const required = getPreviousPeriods(new Date(), totalPeriods);

    if (!latestAppPeriod) return required;

    const [y, m] = latestAppPeriod.split('-').map(Number);
    if (!y || !m) return required;

    const appDate = new Date(y, m - 1, 1);

    const reusable = getPreviousPeriods(appDate, totalPeriods);

    return required.filter((p) => !reusable.includes(p));
  }
}
