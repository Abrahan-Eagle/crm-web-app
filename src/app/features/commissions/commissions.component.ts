import { CurrencyPipe, NgClass, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { CustomInputComponent, PaginationComponent } from '@/components';
import { CommissionListItem, PaginatedResponse } from '@/interfaces';
import { CustomDatePipe, TextInitialsPipe } from '@/pipes';
import { CommissionsService } from '@/services';
import { BusinessConfigService, SearchService, WithSearchable } from '@/utils';

import { CommissionNotFoundComponent } from './components';

@Component({
  selector: 'app-commissions',
  imports: [
    FormsModule,
    NgOptimizedImage,
    RouterLink,
    TextInitialsPipe,
    CommissionNotFoundComponent,
    PaginationComponent,
    CurrencyPipe,
    NgClass,
    CustomDatePipe,
    CustomInputComponent,
  ],
  templateUrl: './commissions.component.html',
  providers: [SearchService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommissionsComponent extends WithSearchable implements OnInit {
  public readonly loading = signal(true);

  public search = '';

  public fromDate = '';

  public toDate = '';

  public readonly commissions = signal<PaginatedResponse<CommissionListItem> | null>(null);

  constructor(
    private readonly commisssionService: CommissionsService,
    public readonly config: BusinessConfigService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.searchCommission();
  }

  override onSearch(): void {
    this.searchCommission();
  }

  private searchCommission(): void {
    this.loading.set(true);
    this.commisssionService
      .searchCommissions(this.searchService.search().copyWith({ sortBy: '+created_at' }))
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((data) => {
        this.searchService.pagination.set(data.pagination);
        this.commissions.set(data);
      });
  }
}
