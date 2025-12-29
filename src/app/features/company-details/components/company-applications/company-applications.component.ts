import { CurrencyPipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { PaginationComponent } from '@/components';
import { ApplicationListItem, PaginatedResponse } from '@/interfaces';
import { CustomDatePipe } from '@/pipes';
import { ApplicationsService } from '@/services';
import { BusinessConfigService, SearchService, WithSearchable } from '@/utils';

@Component({
  selector: 'app-company-applications',
  imports: [CurrencyPipe, CustomDatePipe, NgClass, PaginationComponent, RouterLink],
  templateUrl: './company-applications.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SearchService],
})
export class CompanyApplicationsComponent extends WithSearchable implements OnInit {
  @Input({ required: true }) id!: string;

  public readonly loading = signal(true);

  public readonly applications = signal<PaginatedResponse<ApplicationListItem> | null>(null);

  constructor(
    private readonly applicationsService: ApplicationsService,
    public readonly config: BusinessConfigService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.searchApplication();
  }

  override onSearch(): void {
    this.searchApplication();
  }

  private searchApplication(): void {
    this.loading.set(true);
    this.applicationsService
      .searchApplication(
        this.searchService.search().copyWith({ sortBy: '-created_at', params: { company_id: this.id } }),
      )
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((applications) => {
        this.applications.set(applications), this.searchService.pagination.set(applications.pagination);
      });
  }
}
