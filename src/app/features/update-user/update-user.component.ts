import {
  ChangeDetectionStrategy,
  Component,
  computed,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  signal,
} from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, iif, map, mergeMap, Observable, of, tap } from 'rxjs';

import { CheckboxSelectComponent, CustomInputComponent } from '@/components';
import { Role, User } from '@/interfaces';
import { MeService, UserService } from '@/services';
import { NotificationService, onlyLettersValidator } from '@/utils';

@Component({
  selector: 'app-update-user',
  imports: [CustomInputComponent, ReactiveFormsModule, CheckboxSelectComponent, FormsModule],
  templateUrl: './update-user.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateUserComponent implements OnChanges {
  @Input({ required: true }) user!: User;

  public readonly loading = signal(false);

  public readonly updatingRoles = signal(true);

  @Output() userUpdated = new EventEmitter<boolean>();

  public readonly tenants = computed<{ id: string; name: string }[]>(() => {
    return this.me.user()?.tenants?.map((tenant) => ({ id: tenant, name: this.nameFromId(tenant) })) ?? [];
  });

  public readonly roles = signal<Role[]>([]);

  constructor(
    private readonly _fb: FormBuilder,
    private readonly userService: UserService,
    private readonly me: MeService,
    private readonly notification: NotificationService,
  ) {
    this.loadRoles();
  }

  ngOnChanges(): void {
    this.form.reset();
    this.form.patchValue({
      first_name: this.user.first_name,
      last_name: this.user.last_name,
      tenants: this.user.tenants,
    });
    this.form.updateValueAndValidity();
  }

  public readonly form = this._fb.group({
    first_name: ['', [Validators.required, onlyLettersValidator(), Validators.minLength(2), Validators.maxLength(100)]],
    last_name: ['', [Validators.required, onlyLettersValidator(), Validators.minLength(2), Validators.maxLength(100)]],
    tenants: [[] as string[], [Validators.required, Validators.minLength(1)]],
  });

  public submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    of(this.loading.set(true))
      .pipe(
        mergeMap(() => this.userService.updateUser(this.user.id, this.form.value as Partial<User>)),
        finalize(() => this.loading.set(false)),
      )
      .subscribe(() => {
        this.userUpdated.emit(true);
        this.notification.push({ message: 'User updated successfully', type: 'success' });
        this.form.reset();
      });
  }

  private nameFromId(input: string): string {
    const formattedString = input.replace(/_/g, ' ');

    return formattedString.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  }

  private loadRoles(): void {
    this.userService
      .getRoles()
      .pipe(finalize(() => this.updatingRoles.set(false)))
      .subscribe((roles) => this.roles.set(roles));
  }

  public isChecked(role: string): boolean {
    return this.user.roles.includes(role);
  }

  public toggleRole(role: string, action: 'add' | 'remove'): void {
    of(this.updatingRoles.set(true))
      .pipe(mergeMap(() => iif(() => action === 'add', this.addRole(role), this.removeRole(role))))
      .pipe(finalize(() => this.updatingRoles.set(false)))
      .subscribe(() =>
        this.notification.push({
          message: 'User roles updated successfully',
          type: 'success',
        }),
      );
  }

  addRole(role: string): Observable<void> {
    return this.userService.addRole(this.user.id, role).pipe(
      tap(() => this.user.roles.push(role)),
      map(() => void 0),
    );
  }

  removeRole(role: string): Observable<void> {
    return this.userService.removeRole(this.user.id, role).pipe(
      tap(() => (this.user.roles = this.user.roles.filter((item) => item !== role))),
      map(() => void 0),
    );
  }
}
