import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { ModalComponent, PaginationComponent } from '@/components';
import { PaginatedResponse, Prospect } from '@/interfaces';
import { CustomDatePipe } from '@/pipes';
import { LeadsService } from '@/services';
import { Permissions, SearchService, UserPermissionsService, WithSearchable } from '@/utils';

import { ProspectDetailsComponent } from '../prospect-details';
import { ProspectsNotFoundComponent } from './components';

@Component({
  selector: 'app-prospects',
  imports: [
    NgOptimizedImage,
    PaginationComponent,
    ProspectsNotFoundComponent,
    ProspectDetailsComponent,
    CustomDatePipe,
    ModalComponent,
  ],
  templateUrl: './prospects.component.html',
  providers: [SearchService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProspectsComponent extends WithSearchable implements OnInit {
  @Input() public readonly id!: string;

  public readonly loading = signal(true);

  public readonly prospects = signal<PaginatedResponse<Prospect> | null>(null);

  public readonly selected = signal<Prospect | null>(null);

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
      .searchProspects(this.searchService.search(), this.id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((prospects) => {
        this.searchService.pagination.set(prospects.pagination);
        this.prospects.set(prospects);
      });
  }

  public updateSearch(event: Event): void {
    let query: string;

    if (event) {
      const inputElement = document.getElementById('searchProspect') as HTMLInputElement;
      query = inputElement ? inputElement.value : '';
    } else {
      query = '';
    }

    this.searchService.updateQuery(query);
  }
}
