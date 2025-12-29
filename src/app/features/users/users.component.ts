import { NgClass, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { ModalComponent, PaginationComponent } from '@/components';
import { PaginatedResponse, User } from '@/interfaces';
import { CustomDatePipe, TextInitialsPipe } from '@/pipes';
import { UserService } from '@/services';
import { SearchService, WithSearchable } from '@/utils';

import { CreateUserComponent } from '../create-user';
import { UpdateUserComponent } from '../update-user';
import { ToggleUserComponent, UserNotFoundComponent } from './components';

@Component({
  selector: 'app-users',
  imports: [
    TextInitialsPipe,
    CustomDatePipe,
    PaginationComponent,
    FormsModule,
    NgOptimizedImage,
    UserNotFoundComponent,
    NgClass,
    ModalComponent,
    CreateUserComponent,
    UpdateUserComponent,
    ToggleUserComponent,
  ],
  templateUrl: './users.component.html',
  providers: [SearchService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersComponent extends WithSearchable implements OnInit {
  public readonly users = signal<PaginatedResponse<User> | null>(null);

  public readonly loading = signal(true);

  public readonly current = signal<User | null>(null);

  public search = '';

  override onSearch(): void {
    this.searchUser();
  }

  ngOnInit(): void {
    this.searchUser();
  }

  constructor(private readonly userService: UserService) {
    super();
  }

  public searchUser(): void {
    this.loading.set(true);
    this.userService
      .searchUser(this.searchService.search().copyWith({ sortBy: '-created_at' }))
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((user) => {
        this.searchService.pagination.set(user.pagination);
        this.users.set(user);
      });
  }
}
