import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { ModalComponent } from '@/components';
import { User } from '@/interfaces';
import { SearchModel } from '@/models';
import { TextInitialsPipe } from '@/pipes';
import { UserService } from '@/services';

@Component({
  selector: 'app-search-user',
  imports: [FormsModule, TextInitialsPipe, ModalComponent, NgOptimizedImage],
  templateUrl: './search-user.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchUserComponent {
  public readonly users = signal<User[]>([]);

  public readonly loading = signal(false);

  public readonly nothingFound = signal(false);

  @Output() public readonly userSelected = new EventEmitter<User>();

  constructor(private readonly userService: UserService) {}

  public searchUser(event: any): void {
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
        this.nothingFound.set(data.length === 0);
      });
  }
}
