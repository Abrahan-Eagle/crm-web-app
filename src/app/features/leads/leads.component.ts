import { DecimalPipe, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { ModalComponent, PaginationComponent } from '@/components';
import { LeadGroup, PaginatedResponse } from '@/interfaces';
import { CustomDatePipe, TextInitialsPipe } from '@/pipes';
import { LeadsService } from '@/services';
import { Permissions, SearchService, UserPermissionsService, WithSearchable } from '@/utils';

import { LeadsNotFoundComponent, TransferLeadPropertyComponent } from './components';

@Component({
  selector: 'app-leads',
  imports: [
    NgOptimizedImage,
    TextInitialsPipe,
    PaginationComponent,
    RouterLink,
    CustomDatePipe,
    DecimalPipe,
    LeadsNotFoundComponent,
    TransferLeadPropertyComponent,
    ModalComponent,
  ],
  templateUrl: './leads.component.html',
  providers: [SearchService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeadsComponent extends WithSearchable implements OnInit {
  public readonly loading = signal(true);

  public readonly groups = signal<PaginatedResponse<LeadGroup> | null>(null);

  public readonly selected = signal<LeadGroup | null>(null);

  public readonly permission = Permissions;

  constructor(
    private readonly leadsService: LeadsService,
    public readonly permissions: UserPermissionsService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.searchLeads();
  }

  override onSearch(): void {
    this.searchLeads();
  }

  private searchLeads(): void {
    this.loading.set(true);
    this.leadsService
      .searchLeads(this.searchService.search().copyWith({ sortBy: '-created_at' }))
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((groups) => {
        this.searchService.pagination.set(groups.pagination);
        this.groups.set(groups);
      });
  }

  public updateSearch(event: Event): void {
    let query: string;

    if (event) {
      const inputElement = document.getElementById('searchLead') as HTMLInputElement;
      query = inputElement ? inputElement.value : '';
    } else {
      query = '';
    }

    this.searchService.updateQuery(query);
  }
}
