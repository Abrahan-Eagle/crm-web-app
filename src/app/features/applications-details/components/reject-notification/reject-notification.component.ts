import { ChangeDetectionStrategy, Component, computed, EventEmitter, Input, Output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { CustomSelectComponent, FormErrorMessageComponent } from '@/components';
import { BankNotification, BankNotificationStatus } from '@/interfaces';
import { ApplicationsService } from '@/services';
import { BusinessConfigService } from '@/utils';

import { ApplicationDetailsService } from '../../applications-details.service';

@Component({
  selector: 'app-reject-notification',
  imports: [CustomSelectComponent, ReactiveFormsModule, FormErrorMessageComponent],
  templateUrl: './reject-notification.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RejectNotificationComponent {
  @Input({ required: true }) notification!: BankNotification;

  @Output() rejected = new EventEmitter<BankNotification | null>();

  public readonly loading = signal(false);

  public readonly rejectedReason = computed<{ values: string[]; labels: string[] }>(() => {
    return Object.entries(this.config.rejectedReasons()).reduce(
      (prev, [value, key]) => {
        prev.labels.push(key);
        prev.values.push(value);

        return prev;
      },
      { values: [] as string[], labels: [] as string[] },
    );
  });

  public readonly form;

  constructor(
    private readonly _fb: FormBuilder,
    public readonly config: BusinessConfigService,
    private readonly applicationsService: ApplicationsService,
    private readonly detailsService: ApplicationDetailsService,
  ) {
    this.form = this._fb.group({
      reason: ['', [Validators.required]],
      other: [
        { value: '', disabled: true },
        [Validators.required, Validators.minLength(10), Validators.maxLength(250)],
      ],
    });

    this.form.controls.reason.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      if (value === 'OTHER') {
        this.form.controls.other.enable();
      } else {
        this.form.controls.other.disable();
        this.form.controls.other.setValue('');
      }
      this.form.controls.other.updateValueAndValidity();
    });
  }

  public submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);

    const update = {
      reason: this.form.value.reason!,
      other: this.form.value.other!,
    };
    this.applicationsService
      .rejectNotifications(this.detailsService.application()!.id, this.notification.id, update)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(() =>
        this.rejected.emit({
          ...this.notification,
          status: BankNotificationStatus.REJECTED,
          reject_reason: update.reason,
          reject_reason_description: update.other,
        }),
      );
  }
}
