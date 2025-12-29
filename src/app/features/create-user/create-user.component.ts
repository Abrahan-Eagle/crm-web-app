import { ChangeDetectionStrategy, Component, computed, EventEmitter, Output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, mergeMap, of } from 'rxjs';

import { CheckboxSelectComponent, CustomInputComponent } from '@/components';
import { CreateUser, Role } from '@/interfaces';
import { MeService, UserService } from '@/services';
import { emailValidator, NotificationService, ObjectId, onlyLettersValidator, passwordValidator } from '@/utils';

@Component({
  selector: 'app-create-user',
  imports: [CustomInputComponent, ReactiveFormsModule, CheckboxSelectComponent],
  templateUrl: './create-user.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateUserComponent {
  public readonly loading = signal(false);

  @Output() userCreated = new EventEmitter<boolean>();

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

  public readonly form = this._fb.group({
    first_name: ['', [Validators.required, onlyLettersValidator(), Validators.minLength(2), Validators.maxLength(100)]],
    last_name: ['', [Validators.required, onlyLettersValidator(), Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, emailValidator()]],
    password: ['', [Validators.required, Validators.minLength(8), passwordValidator()]],
    tenants: [[] as string[], [Validators.required, Validators.minLength(1)]],
    roles: [[] as string[], [Validators.required, Validators.minLength(1)]],
  });

  public submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const userForm = {
      id: ObjectId(),
      ...this.form.value,
    } as CreateUser;

    of(this.loading.set(true))
      .pipe(
        mergeMap(() => this.userService.createUser(userForm)),
        finalize(() => this.loading.set(false)),
      )
      .subscribe(() => {
        this.userCreated.emit(true);
        this.notification.push({ message: 'User created successfully', type: 'success' });
        this.form.reset();
      });
  }

  private nameFromId(input: string): string {
    let formattedString = input.replace(/_/g, ' ');

    formattedString = formattedString.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

    return formattedString;
  }

  private loadRoles(): void {
    this.userService.getRoles().subscribe((roles) => this.roles.set(roles));
  }
}
