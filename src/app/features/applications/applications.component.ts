import { CurrencyPipe, NgClass, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { CustomSelectComponent, ModalComponent, PaginationComponent } from '@/components';
import { ApplicationListItem, PaginatedResponse } from '@/interfaces';
import { CustomDatePipe, TextInitialsPipe } from '@/pipes';
import { ApplicationsService } from '@/services';
import { BusinessConfigService, Permissions, SearchService, UserPermissionsService, WithSearchable } from '@/utils';

import { ApplicationNotFoundComponent, DeleteApplicationComponent } from './components';
import { TransferApplicationComponent } from './components/transfer-application';

@Component({
  selector: 'app-applications',
  imports: [
    ApplicationNotFoundComponent,
    NgOptimizedImage,
    RouterLink,
    FormsModule,
    TextInitialsPipe,
    PaginationComponent,
    NgClass,
    CustomDatePipe,
    CurrencyPipe,
    ModalComponent,
    CustomSelectComponent,
    DeleteApplicationComponent,
    TransferApplicationComponent,
  ],
  templateUrl: './applications.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SearchService],
})
export class ApplicationsComponent extends WithSearchable implements OnInit {
  public readonly loading = signal(true);

  public readonly application = signal<PaginatedResponse<ApplicationListItem> | null>(null);

  public search = '';

  public periods = this.getPreviousPeriods(new Date().getMonth() + 2, 12);

  public period = this.periods.at(0);

  public readonly statuses: { values: string[]; labels: string[] } = Object.entries(
    this.config.applicationStatus(),
  ).reduce(
    (prev, [value, key]) => {
      prev.labels.push(key);
      prev.values.push(value);

      return prev;
    },
    { values: [] as string[], labels: [] as string[] },
  );

  public status = signal<string | null>('');

  public readonly permission = Permissions;

  public readonly wiewing = signal<string | null>(null);

  constructor(
    private readonly applicationsService: ApplicationsService,
    public readonly config: BusinessConfigService,
    public readonly permissions: UserPermissionsService,
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
        this.searchService
          .search()
          .copyWith({ sortBy: '-created_at', params: { period: this.period, status: this.status() } }),
      )
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((applications) => {
        this.searchService.pagination.set(applications.pagination);
        this.application.set(applications);
      });
  }

  getPreviousPeriods(currentMonth: number, periodsBack: number): string[] {
    const periods: string[] = [];
    let currentYear = new Date().getFullYear();
    let month = currentMonth;

    for (let i = 0; i < periodsBack; i++) {
      month--;
      if (month === 0) {
        month = 12;
        currentYear--;
      }
      const formattedMonth = month < 10 ? `0${month}` : month;
      periods.push(`${currentYear}-${formattedMonth}`);
    }

    return periods;
  }
}
