import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { finalize, tap } from 'rxjs';

import { CustomInputComponent, PhoneInputComponent } from '@/components';
import { Phone, User } from '@/interfaces';
import { MeService, UserService } from '@/services';
import { NotificationService, onlyLettersValidator } from '@/utils';

@Component({
  selector: 'app-update-profile',
  templateUrl: './update-profile.component.html',
  imports: [CustomInputComponent, ReactiveFormsModule, PhoneInputComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateProfileComponent {
  public readonly showInModal = input(false);

  public readonly updated = output<void>();

  constructor(
    private readonly _fb: FormBuilder,
    private readonly me: MeService,
    private readonly userService: UserService,
    private readonly notification: NotificationService,
  ) {
    effect(() => {
      if (this.me.user()) {
        this.form.patchValue({
          first_name: me.user()?.first_name ?? null,
          last_name: me.user()?.last_name ?? null,
          phone: me.user()?.phone ?? null,
        });
      }
    });
  }

  public readonly form = this._fb.group({
    first_name: ['', [onlyLettersValidator()]],
    last_name: ['', [onlyLettersValidator()]],
    phone: [null as Phone | null, []],
  });

  public readonly loading = signal(false);

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    this.userService
      .updateProfile(this.form.value as Partial<User>)
      .pipe(
        tap(() => this.me.refreshProfile()),
        finalize(() => this.loading.set(false)),
      )
      .subscribe(() => {
        this.updated.emit();
        this.notification.push({ message: 'Profile updated successfully', type: 'success' });
      });
  }
}
