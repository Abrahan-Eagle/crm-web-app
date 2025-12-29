import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ModalComponent } from '@/components';
import { CreateBankComponent } from '@/features/create-bank';
import { Permissions, SearchService, UserPermissionsService } from '@/utils';

import { BankFiltersComponent } from '../bank-filters';

@Component({
  selector: 'app-bank-search-bar',
  imports: [NgOptimizedImage, BankFiltersComponent, ModalComponent, CreateBankComponent],
  templateUrl: './bank-search-bar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BankSearchBarComponent {
  public readonly permission = Permissions;

  constructor(
    private readonly searchService: SearchService,
    public readonly permissions: UserPermissionsService,
  ) {}

  public updateSearch(event: Event): void {
    let query: string;

    if (event) {
      const inputElement = document.getElementById('searchBank') as HTMLInputElement;
      query = inputElement ? inputElement.value : '';
    } else {
      query = '';
    }

    this.searchService.updateQuery(query);
  }
}
