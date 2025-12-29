import { CurrencyPipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize, mergeMap, of } from 'rxjs';

import { PaginationComponent } from '@/components';
import { BankOffer, PaginatedResponse } from '@/interfaces';
import { TextInitialsPipe } from '@/pipes';
import { BankService } from '@/services';
import { BusinessConfigService, SearchService, WithSearchable } from '@/utils';

@Component({
  selector: 'app-bank-offers',
  imports: [PaginationComponent, TextInitialsPipe, RouterLink, CurrencyPipe, NgClass],
  templateUrl: './bank-offers.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SearchService],
})
export class BankOffersComponent extends WithSearchable implements OnInit {
  @Input({ required: true }) bankId!: string;

  public readonly loading = signal(true);

  public readonly offers = signal<PaginatedResponse<BankOffer> | null>(null);

  constructor(
    private readonly bankService: BankService,
    public readonly config: BusinessConfigService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.searchOffers();
  }

  override onSearch(): void {
    this.searchOffers();
  }

  public searchOffers(): void {
    of(this.loading.set(true))
      .pipe(
        mergeMap(() =>
          this.bankService.getBankOffers(this.bankId, this.searchService.search().copyWith({ sortBy: '-created_at' })),
        ),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((offers) => {
        this.offers.set(offers), this.searchService.pagination.set(offers.pagination);
      });
  }
}
