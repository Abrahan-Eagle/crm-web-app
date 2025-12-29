import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { User } from '@/interfaces';
import { SearchModel } from '@/models';
import { TextInitialsPipe } from '@/pipes';
import { LeadsService, UserService } from '@/services';

@Component({
  selector: 'app-transfer-lead-property',
  imports: [TextInitialsPipe, FormsModule],
  templateUrl: 'transfer-lead-property.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransferLeadPropertyComponent {
  @Input({ required: true }) leadId!: string;

  public readonly users = signal<User[]>([]);

  public readonly loading = signal(false);

  public readonly nothingFound = signal(false);

  @Output() public readonly leadTransfered = new EventEmitter<void>();

  constructor(
    private readonly userService: UserService,
    private readonly leadService: LeadsService,
  ) {}

  public searchContacts(event: any): void {
    const value = event.target.value ?? '';
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

  public assignToUser(user: User): void {
    this.loading.set(true);
    this.leadService
      .transferLead(this.leadId, user.id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(() => {
        this.users.set([]);
        this.leadTransfered.emit();
      });
  }
}
