import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { ModalComponent, PaginationComponent } from '@/components';
import { DraftListItem, PaginatedResponse } from '@/interfaces';
import { CustomDatePipe, TextInitialsPipe } from '@/pipes';
import { DraftsService } from '@/services';
import { BusinessConfigService, Permissions, SearchService, UserPermissionsService, WithSearchable } from '@/utils';

import { DeleteDraftComponent, DraftNotFoundComponent, TransferDraftComponent } from './components';

@Component({
  selector: 'app-draft-applications',
  imports: [
    DraftNotFoundComponent,
    NgOptimizedImage,
    RouterLink,
    FormsModule,
    TextInitialsPipe,
    PaginationComponent,
    CustomDatePipe,
    CurrencyPipe,
    ModalComponent,
    DeleteDraftComponent,
    TransferDraftComponent,
  ],
  templateUrl: './draft-applications.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SearchService],
})
export class DraftApplicationsComponent extends WithSearchable implements OnInit {
  public readonly loading = signal(true);

  public readonly drafts = signal<PaginatedResponse<DraftListItem> | null>(null);

  public search = '';

  public readonly permission = Permissions;

  public readonly wiewing = signal<string | null>(null);

  constructor(
    private readonly draftsService: DraftsService,
    public readonly config: BusinessConfigService,
    public readonly permissions: UserPermissionsService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.searchDrafts();
  }

  override onSearch(): void {
    this.searchDrafts();
  }

  private searchDrafts(): void {
    this.loading.set(true);
    this.draftsService
      .searchDrafts(this.searchService.search().copyWith({ sortBy: '-created_at' }))
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((drafts) => {
        this.searchService.pagination.set(drafts.pagination);
        this.drafts.set(drafts);
      });
  }
}
