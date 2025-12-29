import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { finalize, iif, mergeMap, Observable, of } from 'rxjs';

import { User } from '@/interfaces';
import { UserService } from '@/services';
import { NotificationService } from '@/utils';

@Component({
  selector: 'app-toggle-user',
  imports: [],
  templateUrl: 'toggle-user.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleUserComponent {
  @Input({ required: true }) user!: User;

  public readonly loading = signal(false);

  @Output() userUpdated = new EventEmitter<boolean>();

  constructor(
    private readonly userService: UserService,
    private readonly notification: NotificationService,
  ) {}

  public toggle(): void {
    of(this.loading.set(true))
      .pipe(mergeMap(() => iif(() => this.user.status === 'ACTIVE', this.disable(), this.enable())))
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(() => {
        this.userUpdated.emit(true);
        this.notification.push({
          message: 'User updated successfully',
          type: 'success',
        });
      });
  }

  private enable(): Observable<void> {
    return this.userService.enableUser(this.user.id);
  }

  private disable(): Observable<void> {
    return this.userService.disableUser(this.user.id);
  }
}
