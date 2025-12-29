import { ChangeDetectionStrategy, Component, computed, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, mergeMap, of } from 'rxjs';

import { CustomSelectComponent } from '@/components';
import { ApplicationsService } from '@/services';
import { BusinessConfigService } from '@/utils';

@Component({
  selector: 'app-update-substatus',
  imports: [CustomSelectComponent, ReactiveFormsModule],
  templateUrl: './update-substatus.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateStatusComponent {
  @Input({ required: true }) public applicationId!: string;

  @Output() updateStatus = new EventEmitter<string>();

  public readonly loading = signal(false);

  public readonly applicationSubStatus = computed<{ values: string[]; labels: string[] }>(() => {
    return Object.entries(this.config.applicationsubstatus()).reduce(
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
  ) {}

  public form = this._fb.group({
    substatus: ['', [Validators.required]],
  });

  public submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    of(this.loading.set(true))
      .pipe(
        mergeMap(() => this.applicationsService.updateSubStatus(this.applicationId, this.form.value)),
        finalize(() => this.loading.set(false)),
      )
      .subscribe(() => {
        this.updateStatus.emit(this.form.value.substatus!);

        this.form.reset({
          substatus: '',
        });
      });
  }
}
