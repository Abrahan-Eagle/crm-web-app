import { KeyValuePipe, NgClass, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, ElementRef, HostListener, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';

import { BusinessConfigService, Permissions, SearchService, UserPermissionsService } from '@/utils';

@Component({
  selector: 'app-bank-filters',
  imports: [NgOptimizedImage, NgClass, ReactiveFormsModule, KeyValuePipe],
  templateUrl: './bank-filters.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BankFiltersComponent {
  public readonly classifications = computed(() => this.businessConfig.bankClassifications());

  public readonly countries = computed(() => this.businessConfig.supportedCountries());

  public readonly open = signal(false);

  public readonly permission = Permissions;

  @HostListener('document:click', ['$event.target'])
  onClick(btn: any) {
    if (this.open() && !this.ref.nativeElement.contains(btn)) {
      this.open.set(false);
    }
  }

  public readonly form = this.fb.group({
    bank_type: [''],
    classifications: [[] as string[]],
    countries: [[] as string[]],
    territories: [[] as string[]],
    status: [''],
    identification_types: [[] as string[]],
    blacklisted: [false],
  });

  constructor(
    private readonly businessConfig: BusinessConfigService,
    private readonly searchService: SearchService,
    private readonly ref: ElementRef,
    private readonly fb: FormBuilder,
    public readonly permissions: UserPermissionsService,
  ) {}

  public submit(): void {
    this.searchService.search.set(this.searchService.search().copyWith({ params: this.form.value }));
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
