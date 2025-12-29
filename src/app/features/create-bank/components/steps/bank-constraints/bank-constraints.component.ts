import { KeyValuePipe, NgClass, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  CheckboxSelectComponent,
  CustomInputComponent,
  FormErrorMessageComponent,
  SelectIndustriesComponent,
} from '@/components';
import { SelectStatesComponent } from '@/features/bank-details';
import { CreateBankService } from '@/features/create-bank/create-bank.service';
import { BankTerritory, Industry } from '@/interfaces';
import { BusinessConfigService, ObjectId, onlyNumbersDecimalsValidator, onlyNumbersValidator } from '@/utils';

@Component({
  selector: 'app-bank-constraints',
  imports: [
    NgOptimizedImage,
    ReactiveFormsModule,
    CustomInputComponent,
    KeyValuePipe,
    NgClass,
    FormErrorMessageComponent,
    SelectIndustriesComponent,
    CheckboxSelectComponent,
    SelectStatesComponent,
  ],
  templateUrl: './bank-constraints.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FiltersComponent {
  public readonly form = this.formService.form.controls.step_4;

  public territoriesSelected = signal<string[]>([]);

  public readonly blockedProducts = computed(() =>
    Object.keys(this.config.productType()).map((key) => ({
      name: this.config.productType()[key],
      id: key,
    })),
  );

  constructor(
    private readonly _fb: FormBuilder,
    public readonly formService: CreateBankService,
    public readonly config: BusinessConfigService,
  ) {
    this.form.controls.minimum_deposits_required.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      if (value) {
        this.form.controls.deposits_minimum_transactions.setValidators([
          Validators.required,
          onlyNumbersValidator(),
          Validators.min(1),
        ]);
        this.form.controls.deposits_minimum_amount.setValidators([
          Validators.required,
          onlyNumbersDecimalsValidator(),
          Validators.min(1),
        ]);
      } else {
        this.form.controls.deposits_minimum_transactions.clearValidators();
        this.form.controls.deposits_minimum_amount.clearValidators();
      }

      this.form.controls.deposits_minimum_transactions.updateValueAndValidity();
      this.form.controls.deposits_minimum_amount.updateValueAndValidity();
    });
  }

  public submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.formService.next();
  }

  public toggleCheckbox(event: any, control: FormControl<string[] | null> | null): void {
    if (control) {
      const value: string[] = control.value ?? [];
      const index = value.indexOf(event.target.value);
      if (index === -1) {
        value.push(event.target.value);
      } else {
        value.splice(index, 1);
      }

      control.setValue(value);
      control.updateValueAndValidity();
    }
  }

  public removeConstraintByIndustry(index: number): void {
    this.form.controls.by_industries.removeAt(index);
  }

  public addConstraintByIndustry(): void {
    const byIndustry = this.formService._fb.group({
      industry: [[] as Industry[], [Validators.required]],
      minimum_amount: [0, [Validators.required, onlyNumbersDecimalsValidator(), Validators.min(1)]],
      minimum_transactions: [0, [Validators.required, onlyNumbersValidator(), Validators.min(1)]],
      id: [ObjectId()],
    });
    (this.form.controls.by_industries as FormArray).push(byIndustry);
  }

  trackIndustry(item: any): any {
    return item!.id!;
  }

  addTerritory(territory: string, excludedStates: string[]) {
    const territories = this.form.controls.territories as FormArray;
    territories.push(
      this._fb.group({
        territory: [territory ?? '', [Validators.required]],
        excluded_states: [excludedStates ?? []],
      }),
    );
  }

  public toggleTerritory(event: Event): void {
    const territories = (this.form.controls.territories.getRawValue() ?? []) as BankTerritory[];
    const territory = (event.target! as HTMLInputElement).value;
    const index = territories.findIndex((item) => item.territory === territory);
    if (index === -1) {
      this.addTerritory(territory, []);
    } else {
      this.form.controls.territories.removeAt(index);
    }

    this.form.controls.territories.updateValueAndValidity();
    this.territoriesSelected.set(this.form.controls.territories.value.map((item) => item!.territory!));
  }

  public getTerritoryControl(territory: string): FormControl<string[]> {
    const territories = (this.form.controls.territories.getRawValue() ?? []) as BankTerritory[];
    const index = territories.findIndex((item) => item.territory === territory);

    return this.form.controls.territories.at(index).controls.excluded_states;
  }
}
