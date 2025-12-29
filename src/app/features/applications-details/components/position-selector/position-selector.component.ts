import { ChangeDetectionStrategy, Component, input, OnChanges, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { CustomSelectComponent } from '@/components/inputs';
import { APPLICATION_STATUS, ApplicationDetails } from '@/interfaces';
import { ApplicationsService } from '@/services';
import { BusinessConfigService } from '@/utils';

@Component({
  selector: 'app-position-selector',
  standalone: true,
  imports: [ReactiveFormsModule, CustomSelectComponent],
  templateUrl: './position-selector.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PositionSelectorComponent implements OnChanges {
  public readonly application = input.required<ApplicationDetails>();

  public readonly positionUpdated = output<number>();

  public readonly updating = signal(false);

  public readonly form = this._fb.group({
    position: ['', Validators.required],
  });

  constructor(
    private readonly applicationsService: ApplicationsService,
    public readonly config: BusinessConfigService,
    private readonly _fb: FormBuilder,
  ) {}

  ngOnChanges(): void {
    this.form.patchValue({ position: this.application()?.position?.toString() ?? '' });
    if (this.application().status === APPLICATION_STATUS.READY_TO_SEND) {
      this.form.controls.position.enable();
      this.form.enable();
    } else {
      this.form.controls.position.disable();
      this.form.disable();
    }
  }

  public updatePosition(): void {
    const position = this.form.get('position')?.value ?? '';

    if (!this.form.valid || this.application().status !== APPLICATION_STATUS.READY_TO_SEND) return;

    this.updating.set(true);
    this.applicationsService
      .updatePosition(this.application().id, parseInt(position))
      .pipe(finalize(() => this.updating.set(false)))
      .subscribe(() => {
        this.form.reset();
        this.positionUpdated.emit(parseInt(position));
      });
  }
}
