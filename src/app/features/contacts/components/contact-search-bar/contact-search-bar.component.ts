import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ModalComponent } from '@/components';
import { CreateContactComponent } from '@/features/create-contact';
import { Permissions, SearchService, UserPermissionsService } from '@/utils';

@Component({
  selector: 'app-contact-search-bar',
  imports: [NgOptimizedImage, ModalComponent, CreateContactComponent],
  templateUrl: './contact-search-bar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactSearchBarComponent {
  public readonly permission = Permissions;

  constructor(
    private readonly searchService: SearchService,
    public readonly permissions: UserPermissionsService,
  ) {}

  public updateSearch(event: Event): void {
    let query: string;

    if (event) {
      const inputElement = document.getElementById('searchContact') as HTMLInputElement;
      query = inputElement ? inputElement.value : '';
    } else {
      query = '';
    }

    this.searchService.updateQuery(query);
  }
}
