import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { Bank } from '@/interfaces';
import { TextInitialsPipe } from '@/pipes';
import { BusinessConfigService } from '@/utils';

@Component({
  selector: 'app-bank-relevant-details',
  imports: [CurrencyPipe, TextInitialsPipe],
  templateUrl: './bank-relevant-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BankRelevantDetailsComponent {
  @Input({ required: true }) bank!: Partial<Bank>;

  constructor(public readonly config: BusinessConfigService) {}
}
