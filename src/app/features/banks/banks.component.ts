import { CurrencyPipe, NgClass, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { PaginationComponent } from '@/components';
import { BankListItem, PaginatedResponse } from '@/interfaces';
import { TextInitialsPipe } from '@/pipes';
import { BankService } from '@/services';
import { DemographicService, Permissions, SearchService, UserPermissionsService, WithSearchable } from '@/utils';

import { AdvancedBankFiltersComponent, BankSearchBarComponent, BanksNotFoundComponent } from './components';

@Component({
  selector: 'app-banks',
  imports: [
    NgOptimizedImage,
    TextInitialsPipe,
    NgClass,
    PaginationComponent,
    BankSearchBarComponent,
    BanksNotFoundComponent,
    RouterLink,
    CurrencyPipe,
    AdvancedBankFiltersComponent,
  ],
  templateUrl: './banks.component.html',
  providers: [SearchService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BanksComponent extends WithSearchable implements OnInit {
  public readonly loading = signal(true);

  public readonly advancedSearch = signal(false);

  public readonly banks = signal<PaginatedResponse<BankListItem> | null>(null);

  public readonly permission = Permissions;

  constructor(
    private readonly bankService: BankService,
    public readonly demographics: DemographicService,
    public readonly permissions: UserPermissionsService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.searchBanks();
  }

  override onSearch(): void {
    this.searchBanks();
  }

  private searchBanks(): void {
    this.loading.set(true);
    this.bankService
      .searchBanks(this.searchService.search().copyWith({ sortBy: '-created_at' }))
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((banks) => {
        this.searchService.pagination.set(banks.pagination);
        this.banks.set(banks);
      });
  }
}
