import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { CallablePhoneComponent, ModalComponent, PaginationComponent } from '@/components';
import { CompanyListItem, PaginatedResponse } from '@/interfaces';
import { CustomDatePipe, FormatPhonePipe, TextInitialsPipe, YearsAgoPipe } from '@/pipes';
import { CompanyService } from '@/services';
import { Permissions, SearchService, UserPermissionsService, WithSearchable } from '@/utils';

import { CompaniesNotFoundComponent, TransferCompanyComponent } from './components';

@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  imports: [
    RouterLink,
    NgOptimizedImage,
    PaginationComponent,
    TextInitialsPipe,
    FormatPhonePipe,
    CustomDatePipe,
    YearsAgoPipe,
    FormsModule,
    CompaniesNotFoundComponent,
    CallablePhoneComponent,
    ModalComponent,
    TransferCompanyComponent,
  ],
  providers: [SearchService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompaniesComponent extends WithSearchable implements OnInit {
  public readonly loading = signal(true);

  public readonly companies = signal<PaginatedResponse<CompanyListItem> | null>(null);

  public search = '';

  public readonly permission = Permissions;

  public readonly selected = signal<string | null>(null);

  constructor(
    private readonly companyService: CompanyService,
    public readonly permissions: UserPermissionsService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.searchCompanies();
  }

  override onSearch(): void {
    this.searchCompanies();
  }

  private searchCompanies(): void {
    this.loading.set(true);
    this.companyService
      .searchCompanies(this.searchService.search().copyWith({ sortBy: '-created_at' }))
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((companies) => {
        this.searchService.pagination.set(companies.pagination);
        this.companies.set(companies);
      });
  }
}
