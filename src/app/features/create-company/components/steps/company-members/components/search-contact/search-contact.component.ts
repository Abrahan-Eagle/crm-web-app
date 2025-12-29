import { ChangeDetectionStrategy, Component, EventEmitter, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { ContactSummary } from '@/interfaces';
import { SearchModel } from '@/models';
import { TextInitialsPipe } from '@/pipes';
import { ContactService } from '@/services';

@Component({
  selector: 'app-member-form-search-contact',
  imports: [TextInitialsPipe, FormsModule],
  templateUrl: './search-contact.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchContactComponent {
  public readonly contacts = signal<ContactSummary[]>([]);

  public readonly loading = signal(false);

  public readonly nothingFound = signal(false);

  @Output() public readonly contactSelected = new EventEmitter<ContactSummary>();

  constructor(private readonly contactService: ContactService) {}

  public searchContacts(event: any): void {
    const value = event.target.value ?? '';
    if (!value || !value.trim()) {
      return;
    }

    this.contacts.set([]);
    this.nothingFound.set(false);
    this.loading.set(true);

    this.contactService
      .searchContacts(SearchModel.EMPTY.copyWith({ search: value, limit: 5 }))
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((response) => {
        this.contacts.set(response.data);
        this.nothingFound.set(response.data.length === 0);
      });
  }
}
