import { KeyValuePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, ElementRef, HostListener, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { CheckboxSelectComponent, CustomInputComponent, SelectIndustriesComponent } from '@/components';
import { Industry } from '@/interfaces';
import { BusinessConfigService, onlyNumbersValidator, SearchService } from '@/utils';

@Component({
  selector: 'app-advanced-bank-filters',
  imports: [
    ReactiveFormsModule,
    KeyValuePipe,
    CustomInputComponent,
    SelectIndustriesComponent,
    CheckboxSelectComponent,
  ],
  templateUrl: './advanced-bank-filters.component.html',
  providers: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdvancedBankFiltersComponent {
  @HostListener('document:click', ['$event.target'])
  onClick(btn: any) {
    if (this.open() && !this.ref.nativeElement.contains(btn)) {
      this.open.set(false);
    }
  }

  public readonly classifications = computed(() => this.businessConfig.bankClassifications());

  public readonly countries = computed(() => this.businessConfig.supportedCountries());

  public readonly open = signal(false);

  public readonly form = this.fb.group({
    classifications: [[] as string[]],
    countries: [[] as string[]],
    territories: [[] as string[]],
    deposits_minimum_transactions: [null as null | number, [onlyNumbersValidator()]],
    deposits_minimum_amount: [null as null | number, [onlyNumbersValidator()]],
    maximum_negative_days: [null as null | number, [Validators.max(31), onlyNumbersValidator()]],
    minimum_daily_balance: [null as null | number, [onlyNumbersValidator()]],
    loan_limit: [null as null | number, [onlyNumbersValidator()]],
    minimum_months_in_business: [null as null | number, [Validators.max(120), onlyNumbersValidator()]],
    supported_ids: new FormControl<string[]>([], []),
    allowed_industries: new FormControl<Industry[]>([], []),
    positions: [[] as number[], []],
    id_type: [null as null | string, []],
  });

  constructor(
    public readonly businessConfig: BusinessConfigService,
    private readonly searchService: SearchService,
    private readonly ref: ElementRef,
    private readonly fb: FormBuilder,
  ) {}

  public submit(): void {
    const { allowed_industries, ...value } = this.form.value;
    this.searchService.search.set(
      this.searchService
        .search()
        .copyWith({ params: { ...value, allowed_industries: allowed_industries?.map((industry) => industry.id) } }),
    );

    this.open.set(false);
  }

  public toggleCheckbox(event: any, control: FormControl<string[] | null>): void {
    const value: string[] = control.value ?? [];
    const index = value.indexOf(event.target.value);
    if (index === -1) {
      value.push(event.target.value);
    } else {
      value.splice(index, 1);
    }

    control.updateValueAndValidity();
  }
}
