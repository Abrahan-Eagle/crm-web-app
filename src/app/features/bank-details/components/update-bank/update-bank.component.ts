import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, Validators } from '@angular/forms';

import { Bank, Industry } from '@/interfaces';
import {
  BusinessConfigService,
  DemographicService,
  ObjectId,
  onlyNumbersDecimalsValidator,
  onlyNumbersValidator,
} from '@/utils';

import { UpdateBankContainerComponent, UpdateBankFiltersComponent } from './components';
import { UpdateBankService } from './update-bank.service';

@Component({
  selector: 'app-update-bank-constraints',
  imports: [UpdateBankFiltersComponent, UpdateBankFiltersComponent, NgClass, UpdateBankContainerComponent],
  templateUrl: './update-bank.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [UpdateBankService],
})
export class UpdateBankComponent implements OnInit {
  @Input({ required: true }) bank!: Bank;

  public readonly loading = signal(false);

  @Output() bankUpdated = new EventEmitter<Bank>();

  constructor(
    public readonly formService: UpdateBankService,
    private readonly _fb: FormBuilder,
    private readonly demographicService: DemographicService,
    private readonly config: BusinessConfigService,
  ) {
    this.formService.bankUpdated.pipe(takeUntilDestroyed()).subscribe(() => this.bankUpdated.emit());
  }

  ngOnInit(): void {
    this.formService.id.set(this.bank.id);
    this.syncForm();
  }

  bankUpdatedHandler(bank: Bank): void {
    this.bankUpdated.emit(bank);
  }

  addTerritory(territory: string, excluded_states: string[]) {
    const territories = this.formService.form.controls.step_1.controls.territories as FormArray;
    territories.push(
      this._fb.group({
        territory: [territory],
        excluded_states: [excluded_states ?? []],
      }),
    );
  }

  loadExcludedStateNames() {
    const territories = this.formService.form.controls.step_1.controls.territories as FormArray;

    territories.controls.forEach((territoryControl) => {
      const territory = territoryControl.get('territory')?.value;
      const excludedStates = territoryControl.get('excluded_states')?.value;

      if (territory && excludedStates && excludedStates.length > 0) {
        const territoryName = this.config.territories()[territory];

        this.demographicService.getStates(territoryName).subscribe((states) => {
          const statesMap = Object.entries(states || {}).map(([code, name]) => ({
            name,
            code,
          }));

          const excludedStateNames = excludedStates.map((stateCode: string) => {
            const match = statesMap.find((item) => item.code === stateCode);
            return match ? match : stateCode;
          });

          territoryControl.get('excluded_states')?.setValue(excludedStateNames);
        });
      }
    });
  }

  syncForm(): void {
    this.formService.form.controls.step_1.patchValue({
      deposits_minimum_amount: this.bank.constraints.deposits?.minimum_amount ?? 0,
      deposits_minimum_transactions: this.bank.constraints.deposits?.minimum_transactions ?? 0,
      classifications: this.bank.constraints.classifications,
      positions: this.bank.constraints.positions,
      blocked_products: this.bank.constraints.blocked_products,
    });

    this.bank.constraints.territories.forEach((item) => this.addTerritory(item.territory, item.excluded_states));

    this.loadExcludedStateNames();

    this.formService.form.controls.step_2.patchValue({
      supported_ids: this.bank.constraints.supported_ids,
      loan_limit: this.bank.constraints.loan_limit,
      has_loan_limit: this.bank.constraints.has_loan_limit,
      minimum_loan: this.bank.constraints.minimum_loan,
      minimum_months_in_business: this.bank.constraints.minimum_months_in_business,
      minimum_daily_balance: this.bank.constraints.minimum_daily_balance,
      maximum_negative_days: this.bank.constraints.maximum_negative_days,
      allowed_industries: this.bank.constraints.allowed_industries,
    });

    this.bank.constraints.deposits?.by_industries?.map((constraint) => this.addConstraintByIndustry(constraint));
    if (this.bank.constraints.deposits?.minimum_amount && this.bank.constraints.deposits?.minimum_transactions) {
      this.formService.form.controls.step_1.controls.minimum_deposits_required.setValue(true);
    }
  }

  public addConstraintByIndustry(constraint?: {
    minimum_amount: number;
    minimum_transactions: number;
    industry: Industry;
  }): void {
    const byIndustries = this.formService.form.controls.step_1.controls.by_industries as FormArray;

    byIndustries.push(
      this._fb.group({
        industry: [constraint?.industry ? [constraint?.industry] : ([] as Industry[]), [Validators.required]],
        minimum_amount: [
          constraint?.minimum_amount ?? 0,
          [Validators.required, onlyNumbersDecimalsValidator(), Validators.min(1)],
        ],
        minimum_transactions: [
          constraint?.minimum_transactions ?? 0,
          [Validators.required, onlyNumbersValidator(), Validators.min(1)],
        ],
        id: [ObjectId()],
      }),
    );
  }
}
