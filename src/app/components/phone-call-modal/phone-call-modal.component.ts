import { ChangeDetectionStrategy, Component, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { MakeACall } from '@/interfaces';
import { VoIPService } from '@/services';
import { NotificationService } from '@/utils';

import { ModalComponent } from '../modal';

@Component({
  selector: 'app-phone-call-modal',
  imports: [ModalComponent],
  templateUrl: './phone-call-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhoneCallModalComponent {
  @ViewChild('modal') modal!: ModalComponent;

  public readonly callRequest = signal<MakeACall | null>(null);

  public readonly loading = signal(false);

  constructor(
    private readonly voip: VoIPService,
    private readonly notification: NotificationService,
  ) {
    this.voip.callRequested
      .asObservable()
      .pipe(takeUntilDestroyed())
      .subscribe((request) => {
        this.callRequest.set(request);
        this.modal.open();
      });
  }

  public proceed(): void {
    if (this.loading() || !this.callRequest()) {
      return;
    }

    this.loading.set(true);
    this.voip
      .makeACall(this.callRequest()!)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(() => {
        this.notification.push({
          message: 'You will receive a call shortly',
          type: 'info',
        });
        this.modal.close();
      });
  }
}
