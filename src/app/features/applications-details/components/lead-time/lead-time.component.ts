import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnChanges, signal } from '@angular/core';

import { BusinessConfigService } from '@/utils';

@Component({
  selector: 'app-lead-time',
  imports: [NgClass],
  templateUrl: './lead-time.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeadTimeComponent implements OnChanges {
  @Input({ required: true }) currentStatus!: string;

  @Input() substatus?: string | null;

  public readonly steps: string[][] = [
    ['READY_TO_SEND'],
    ['SENT'],
    ['REPLIED', 'OFFERED'],
    ['OFFER_ACCEPTED', 'REJECTED'],
    ['COMPLETED'],
  ];

  public readonly labelSteps = new Map(
    Object.entries({
      READY_TO_SEND: 'Ready to send',
      SENT: 'Sent',
      REPLIED_OFFERED: 'Replied / Offered',
      OFFER_ACCEPTED_REJECTED: 'Accepted / Rejected',
      COMPLETED: 'Completed',
      REJECTED: 'Rejected',
      REPLIED: 'Replied',
      OFFERED: 'Offered',
      OFFER_ACCEPTED: 'Offer accepted',
    }),
  );

  public readonly completedSteps = signal(0);

  constructor(public readonly config: BusinessConfigService) {}

  ngOnChanges(): void {
    this.completedSteps.set(this.steps.findIndex((step) => step.includes(this.currentStatus)));
  }
}
