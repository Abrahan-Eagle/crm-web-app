import { ChangeDetectionStrategy, Component, Input, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize, mergeMap, of } from 'rxjs';

import { PaginationComponent } from '@/components';
import { CompanyDetails, PaginatedResponse } from '@/interfaces';
import { CustomDatePipe, TextInitialsPipe } from '@/pipes';
import { ContactService } from '@/services';
import { SearchService, WithSearchable } from '@/utils';

@Component({
  selector: 'app-contact-companies',
  imports: [CustomDatePipe, TextInitialsPipe, RouterLink, PaginationComponent],
  templateUrl: './contact-companies.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SearchService],
})
export class ContactCompaniesComponent extends WithSearchable implements OnInit {
  @Input({ required: true }) contactId!: string;

  public readonly contactCompanies = signal<PaginatedResponse<CompanyDetails> | null>(null);

  public readonly loading = signal(true);

  constructor(private readonly contactService: ContactService) {
    super();
  }

  override onSearch(): void {
    this.getContactCompanies();
  }

  ngOnInit(): void {
    this.getContactCompanies();
  }

  public getContactCompanies(): void {
    of(this.loading.set(true))
      .pipe(
        mergeMap(() =>
          this.contactService.getContactCompanies(
            this.contactId,
            this.searchService.search().copyWith({ sortBy: '-created_at' }),
          ),
        ),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((companies) => {
        this.contactCompanies.set(companies), this.searchService.pagination.set(companies.pagination);
      });
  }
}
