import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { User } from '@/interfaces';
import { SearchModel } from '@/models';
import { TextInitialsPipe } from '@/pipes';
import { CompanyService, UserService } from '@/services';

@Component({
  selector: 'app-transfer-company',
  imports: [TextInitialsPipe, FormsModule],
  templateUrl: './transfer-company.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransferCompanyComponent {
  @Input({ required: true }) companyId!: string;

  public readonly users = signal<User[]>([]);

  public readonly loading = signal(false);

  public readonly nothingFound = signal(false);

  @Output() public readonly companyTransfered = new EventEmitter<void>();

  constructor(
    private readonly userService: UserService,
    private readonly companyService: CompanyService,
  ) {}

  public searchUser(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (!value || !value.trim()) {
      return;
    }

    this.users.set([]);
    this.nothingFound.set(false);
    this.loading.set(true);

    this.userService
      .searchUser(SearchModel.EMPTY.copyWith({ search: value, limit: 5 }))
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((response) => {
        const data = response.data.filter((user) => user.status === 'ACTIVE');
        this.users.set(data);
        this.nothingFound.set(response.data.length === 0);
      });
  }

  public assignToUser(user: string): void {
    this.loading.set(true);
    this.companyService
      .transferCompany(this.companyId, user)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(() => {
        this.users.set([]);
        this.companyTransfered.emit();
      });
  }
}
