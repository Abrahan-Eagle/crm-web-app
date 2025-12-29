import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { ModalComponent } from '@/components';
import { CompanyListItem } from '@/interfaces';
import { SearchModel } from '@/models';
import { TextInitialsPipe } from '@/pipes';
import { CompanyService } from '@/services';

@Component({
  selector: 'app-search-company',
  imports: [FormsModule, TextInitialsPipe, ModalComponent, NgOptimizedImage],
  templateUrl: './search-company.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchCompanyComponent {
  public readonly companys = signal<CompanyListItem[]>([]);

  public readonly loading = signal(false);

  public readonly nothingFound = signal(false);

  @Output() public readonly companySelected = new EventEmitter<CompanyListItem>();

  constructor(private readonly companyService: CompanyService) {}

  public searchCompany(event: any): void {
    const value = event.target.value ?? '';
    if (!value || !value.trim()) {
      return;
    }

    this.companys.set([]);
    this.nothingFound.set(false);
    this.loading.set(true);

    this.companyService
      .searchCompanies(SearchModel.EMPTY.copyWith({ search: value, limit: 5 }))
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((response) => {
        this.companys.set(response.data);
        this.nothingFound.set(response.data.length === 0);
      });
  }
}
