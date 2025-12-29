import { ChangeDetectionStrategy, Component, EventEmitter, input, Output, signal } from '@angular/core';
import { finalize, iif, mergeMap, Observable, of } from 'rxjs';

import { Campaign } from '@/interfaces';
import { CampaignService } from '@/services';
import { NotificationService } from '@/utils';

@Component({
  selector: 'app-toggle-campaign',
  templateUrl: 'toggle-campaign.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleCampaignComponent {
  public readonly campaign = input.required<Campaign>();

  public readonly loading = signal(false);

  @Output() campaignUpdated = new EventEmitter<boolean>();

  constructor(
    private readonly campaignService: CampaignService,
    private readonly notification: NotificationService,
  ) {}

  public toggle(): void {
    of(this.loading.set(true))
      .pipe(mergeMap(() => iif(() => this.campaign().status === 'STOPPED', this.start(), this.stop())))
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(() => {
        this.campaignUpdated.emit(true);
        this.notification.push({
          message: 'Campaign updated successfully',
          type: 'success',
        });
      });
  }

  private start(): Observable<void> {
    return this.campaignService.startCampaign(this.campaign().id);
  }

  private stop(): Observable<void> {
    return this.campaignService.stopCampaign(this.campaign().id);
  }
}
