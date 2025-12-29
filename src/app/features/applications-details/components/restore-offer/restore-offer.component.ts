import { ChangeDetectionStrategy, Component, Input, output, signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { finalize } from 'rxjs';

import { ApplicationDetailsService } from '@/features/applications-details';
import { ApplicationsService } from '@/services';

@Component({
  selector: 'app-restore-offer',
  imports: [],
  templateUrl: './restore-offer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RestoreOfferComponent {
  @Input({ required: true }) public notificationId!: string;

  public readonly loading = signal(false);

  public readonly restored = output<void>();

  constructor(
    public readonly _fb: FormBuilder,
    private readonly applicationsService: ApplicationsService,
    private readonly app: ApplicationDetailsService,
  ) {}

  public submit(): void {
    this.loading.set(true);
    this.applicationsService
      .restoreNotification(this.app.application()!.id, this.notificationId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(() => this.restored.emit());
  }
}
