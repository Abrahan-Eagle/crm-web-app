import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { User } from '@/interfaces';
import { SearchModel } from '@/models';
import { TextInitialsPipe } from '@/pipes';
import { DraftsService, UserService } from '@/services';

@Component({
  selector: 'app-transfer-draft',
  imports: [TextInitialsPipe, FormsModule],
  templateUrl: './transfer-draft.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransferDraftComponent {
  @Input({ required: true }) draftId!: string;

  public readonly users = signal<User[]>([]);

  public readonly loading = signal(false);

  public readonly nothingFound = signal(false);

  @Output() public readonly draftTransfered = new EventEmitter<void>();

  constructor(
    private readonly userService: UserService,
    private readonly draftService: DraftsService,
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
    this.draftService
      .transferDraft(this.draftId, user)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(() => {
        this.users.set([]);
        this.draftTransfered.emit();
      });
  }
}
