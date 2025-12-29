import { KeyValuePipe, NgClass, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, EventEmitter, OnInit, Output, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  CheckboxSelectComponent,
  CustomInputComponent,
  FormErrorMessageComponent,
  SelectIndustriesComponent,
} from '@/components';
import { Bank, BankTerritory, Industry } from '@/interfaces';
import { BusinessConfigService, ObjectId, onlyNumbersDecimalsValidator, onlyNumbersValidator } from '@/utils';

import { UpdateBankService } from '../../../update-bank.service';
import { SelectStatesComponent } from '../../form';

@Component({
  selector: 'app-update-bank-filters',
  imports: [
    ReactiveFormsModule,
    CustomInputComponent,
    NgClass,
    FormErrorMessageComponent,
    KeyValuePipe,
    NgOptimizedImage,
    SelectIndustriesComponent,
    CheckboxSelectComponent,
    CheckboxSelectComponent,
    SelectStatesComponent,
  ],
  templateUrl: './update-bank-filters.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateBankFiltersComponent implements OnInit {
  @Output() bankUpdated = new EventEmitter<Bank>();

  public readonly form = this.updateBank.form.controls.step_1;

  public territoriesSelected = signal<string[]>([]);

  public readonly blockedProducts = computed(() =>
    Object.keys(this.config.productType()).map((key) => ({
      name: this.config.productType()[key],
      id: key,
    })),
  );

  isTerritoryChecked(territoryKey: string): boolean {
    const territories = this.form.controls.territories?.value ?? [];
    return territories.map((t: any) => t.territory).includes(territoryKey);
  }

  constructor(
    public readonly updateBank: UpdateBankService,
    public readonly config: BusinessConfigService,
    private readonly _fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.form.controls.territories.value.forEach((item) => this.territoriesSelected().push(item.territory!));
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

  public addConstraintByIndustry(constraint?: {
    minimum_amount: number;
    minimum_transactions: number;
    industry: Industry;
  }): void {
    const byIndustries = this.form.controls.by_industries as FormArray;

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

  trackIndustry(item: any): any {
    return item!.id!;
  }

  public submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.updateBank.next();
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
