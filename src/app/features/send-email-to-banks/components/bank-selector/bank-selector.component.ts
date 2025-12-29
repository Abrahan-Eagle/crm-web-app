import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { BankListItem } from '@/interfaces';
import { TextInitialsPipe } from '@/pipes';
import { BankService } from '@/services';
import { SearchService, WithSearchable } from '@/utils';

@Component({
  selector: 'app-bank-selector',
  imports: [FormsModule, TextInitialsPipe, NgClass],
  templateUrl: './bank-selector.component.html',
  providers: [SearchService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BankSelectorComponent extends WithSearchable {
  public readonly banksSelected = output<BankListItem[]>();

  public searchTerm = '';

  public readonly loading = signal(false);

  public readonly selected = signal<Map<string, BankListItem>>(new Map());

  public readonly banks = signal<BankListItem[]>([]);

  public readonly nothingFound = signal(false);

  constructor(private readonly bankService: BankService) {
    super();
  }

  override onSearch(): void {
    this.getBanks();
  }

  private getBanks(): void {
    this.loading.set(true);
    this.nothingFound.set(false);

    this.bankService
      .searchBanks(this.searchService.search())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((response) => {
        this.banks.set(response.data);
        this.nothingFound.set(response.data.length === 0);
      });
  }

  toggleSelection(bank: BankListItem): void {
    const selectedBanks = this.selected();
    if (selectedBanks.has(bank.id)) {
      selectedBanks.delete(bank.id);
    } else {
      selectedBanks.set(bank.id, bank);
    }

    this.selected.set(selectedBanks);
  }

  emitSelection(emitValues = true) {
    this.banksSelected.emit(emitValues ? Array.from(this.selected().values()) : []);
    this.banks.set([]);
    this.selected.set(new Map());
    this.searchTerm = '';
  }
}
