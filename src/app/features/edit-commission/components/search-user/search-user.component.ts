import { ChangeDetectionStrategy, Component, EventEmitter, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { User } from '@/interfaces';
import { SearchModel } from '@/models';
import { TextInitialsPipe } from '@/pipes';
import { UserService } from '@/services';

@Component({
  selector: 'app-search-user',
  imports: [TextInitialsPipe, FormsModule],
  templateUrl: './search-user.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchUserComponent {
  public readonly users = signal<User[]>([]);

  public readonly loading = signal(false);

  @Output() public readonly userSelected = new EventEmitter<User>();

  constructor(private readonly userService: UserService) {}

  public searchUser(event: any): void {
    const value = event.target.value ?? '';
    if (!value || !value.trim()) {
      return;
    }
    ``;
    this.users.set([]);
    this.loading.set(true);

    this.userService
      .searchUser(SearchModel.EMPTY.copyWith({ search: value, limit: 5 }))
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((response) => this.users.set(response.data.filter((user) => user.status === 'ACTIVE')));
  }
}
