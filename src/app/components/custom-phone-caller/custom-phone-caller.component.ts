import { ChangeDetectionStrategy, Component, signal, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { VoIPService } from '@/services';
import { NotificationService } from '@/utils';

import { PhoneInputComponent } from '../inputs';
import { ModalComponent } from '../modal';

@Component({
  selector: 'app-custom-phone-caller',
  imports: [ModalComponent, ReactiveFormsModule, PhoneInputComponent],
  templateUrl: './custom-phone-caller.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomPhoneCallerComponent {
  @ViewChild('modal') modal!: ModalComponent;

  public readonly loading = signal(false);

  public readonly form = this._fb.group({ phone: [null, [Validators.required]] });

  constructor(
    private readonly _fb: FormBuilder,
    private readonly caller: VoIPService,
    private readonly notification: NotificationService,
  ) {}

  requestACall() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.caller
      .makeACustomCall(this.form.value!.phone!)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(() => {
        this.modal.close();
        this.form.reset();
        this.notification.push({
          message: 'Call requested successfully',
          type: 'success',
        });
      });
  }
}
