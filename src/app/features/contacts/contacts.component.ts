import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { CallablePhoneComponent, PaginationComponent } from '@/components';
import { ContactSummary, PaginatedResponse } from '@/interfaces';
import { FormatPhonePipe, TextInitialsPipe } from '@/pipes';
import { ContactService } from '@/services';
import { DemographicService, SearchService, WithSearchable } from '@/utils';

import { ContactSearchBarComponent, ContactsNotFoundComponent } from './components';

@Component({
  selector: 'app-contacts',
  imports: [
    NgOptimizedImage,
    TextInitialsPipe,
    PaginationComponent,
    ContactSearchBarComponent,
    ReactiveFormsModule,
    FormatPhonePipe,
    RouterLink,
    ContactsNotFoundComponent,
    CallablePhoneComponent,
  ],
  templateUrl: './contacts.component.html',
  providers: [SearchService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactsComponent extends WithSearchable implements OnInit {
  public readonly loading = signal(true);

  public readonly contacts = signal<PaginatedResponse<ContactSummary> | null>(null);

  constructor(
    private readonly contactService: ContactService,
    public readonly demographics: DemographicService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.searchContacts();
  }

  override onSearch(): void {
    this.searchContacts();
  }

  private searchContacts(): void {
    this.loading.set(true);
    this.contactService
      .searchContacts(this.searchService.search().copyWith({ sortBy: '-created_at' }))
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((contacts) => {
        this.searchService.pagination.set(contacts.pagination);
        this.contacts.set(contacts);
      });
  }
}
