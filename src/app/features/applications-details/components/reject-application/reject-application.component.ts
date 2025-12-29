import { ChangeDetectionStrategy, Component, computed, EventEmitter, Output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { CustomSelectComponent, FormErrorMessageComponent } from '@/components';
import { APPLICATION_STATUS, ApplicationDetails } from '@/interfaces';
import { ApplicationsService } from '@/services';
import { BusinessConfigService } from '@/utils';

import { ApplicationDetailsService } from '../../applications-details.service';

@Component({
  selector: 'app-reject-application',
  imports: [ReactiveFormsModule, CustomSelectComponent, FormErrorMessageComponent],
  templateUrl: './reject-application.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RejectApplicationComponent {
  public readonly form;

  public readonly loading = signal(false);

  @Output() applicationRejected = new EventEmitter<ApplicationDetails | null>();

  public readonly applicationStatus = computed<{ values: string[]; labels: string[] }>(() => {
    return Object.entries(this.config.rejectedReasons()).reduce(
      (prev, [value, key]) => {
        prev.labels.push(key);
        prev.values.push(value);

        return prev;
      },
      { values: [] as string[], labels: [] as string[] },
    );
  });

  constructor(
    private readonly _fb: FormBuilder,
    public readonly config: BusinessConfigService,
    private readonly applicationsService: ApplicationsService,
    private readonly details: ApplicationDetailsService,
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

    const updateApplication = {
      reason: this.form.value.reason!,
      other: this.form.value.other!,
    };

    this.loading.set(true);
    this.applicationsService
      .rejectApplication(this.details.application()!.id, updateApplication)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(() => {
        this.applicationRejected.emit({
          ...this.details.application()!,
          status: APPLICATION_STATUS.REJECTED,
          reject_reason: updateApplication.reason,
          reject_reason_description: updateApplication.other,
        });
      });
  }
}
