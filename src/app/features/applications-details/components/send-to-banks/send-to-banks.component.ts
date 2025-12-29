import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, input, OnChanges, Output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, iif, map, mergeMap, Observable, of } from 'rxjs';

import { FormErrorMessageComponent, ModalComponent } from '@/components';
import { Bank, BankListItem } from '@/interfaces';
import { SearchModel } from '@/models';
import { TextInitialsPipe } from '@/pipes';
import { ApplicationsService, BankService } from '@/services';
import { Permissions, UserPermissionsService } from '@/utils';

import { ApplicationDetailsService } from '../../applications-details.service';
import { BankRelevantDetailsComponent } from '../bank-relevant-details';

@Component({
  selector: 'app-send-to-banks',
  imports: [
    NgOptimizedImage,
    ReactiveFormsModule,
    FormsModule,
    TextInitialsPipe,
    ModalComponent,
    BankRelevantDetailsComponent,
    FormErrorMessageComponent,
  ],
  templateUrl: './send-to-banks.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SendToBanksComponent implements OnChanges {
  public readonly appId = this.detailsService.application()!.id;

  public readonly position = input.required();

  @Output() sentToBanks = new EventEmitter<any | null>();

  public readonly selectedIds = signal<Set<string>>(new Set());

  public readonly search = signal<string>('');

  public readonly bankInModal = signal<Partial<Bank> | null>(null);

  public readonly banks = signal<Partial<Bank & { country_iso_code_2?: string }>[]>([]);

  public readonly loading = signal(true);

  public readonly form;

  public readonly permission = Permissions;

  constructor(
    private readonly applicationsService: ApplicationsService,
    public readonly _fb: FormBuilder,
    private readonly detailsService: ApplicationDetailsService,
    private readonly bankService: BankService,
    public readonly permissions: UserPermissionsService,
  ) {
    this.form = this._fb.group({
      message: ['', [Validators.required, Validators.maxLength(800), Validators.minLength(15)]],
      bank_ids: [[] as string[], [Validators.required]],
    });

    // Trick to save computation when checking whether or not it is selected
    this.form.controls.bank_ids.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((ids) => this.selectedIds.set(new Set(ids)));
  }

  ngOnChanges(): void {
    this.getBanks();
  }

  public submit(): void {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.applicationsService
      .sendAppToBanks(this.appId, {
        message: this.form.value!.message!,
        bank_ids: this.form.value!.bank_ids!,
      })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(() =>
        this.sentToBanks.emit({
          status: 'SENT',
        }),
      );
  }

  public toggleBank(id: string): void {
    const ids = [...(this.form.controls?.bank_ids.value ?? [])];
    const index = ids.indexOf(id);
    if (index > -1) {
      ids.splice(index, 1);
    } else {
      ids.push(id);
    }

    this.form.controls.bank_ids.setValue(ids);
    this.form.controls.bank_ids.updateValueAndValidity();
  }

  public toggleAll(event: Event) {
    const markAll = (event.target as HTMLInputElement).checked;
    if (markAll) {
      this.form.controls.bank_ids.setValue(this.banks().map((bank) => bank.id!));
    } else {
      this.form.controls.bank_ids.setValue([]);
    }

    this.form.controls.bank_ids.updateValueAndValidity();
  }

  public getBanks() {
    this.reset();

    of({})
      .pipe(
        mergeMap(() => iif(() => this.search().trim() != '', this.searchBanks(), this.getRecommendedBanks())),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((banks) => this.banks.set(banks));
  }

  private getRecommendedBanks(): Observable<Partial<BankListItem>[]> {
    return this.applicationsService.getRecommendedBanks(this.appId);
  }

  private searchBanks(): Observable<Partial<BankListItem>[]> {
    return this.bankService
      .searchBanks(SearchModel.EMPTY.copyWith({ limit: 10, search: this.search() }))
      .pipe(map((response) => response.data));
  }

  private reset() {
    this.loading.set(true);
    this.bankInModal.set(null);
    this.banks.set([]);
  }
}
