import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { catchError, finalize } from 'rxjs';

import { Commission } from '@/interfaces';
import { TextInitialsPipe } from '@/pipes';
import { CommissionsService } from '@/services';
import { BusinessConfigService, ErrorHandlerService } from '@/utils';

@Component({
  selector: 'app-commission-details',
  imports: [CurrencyPipe, TextInitialsPipe, NgOptimizedImage],
  templateUrl: './commission-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommissionDetailsComponent {
  @Input({ required: true }) set id(value: string) {
    this.getCommision(value);
  }

  public readonly loading = signal(false);

  public readonly commission = signal<Commission | null>(null);

  constructor(
    public readonly config: BusinessConfigService,
    private readonly _commissionService: CommissionsService,
    private readonly errorHandlerService: ErrorHandlerService,
  ) {}

  public getCommision(id: string): void {
    this.loading.set(true);
    this._commissionService
      .getCommission(id, true)
      .pipe(
        finalize(() => this.loading.set(false)),
        catchError((error: HttpErrorResponse) =>
          this.errorHandlerService.resolveNotFound(error, '/commissions', 'Commission not found'),
        ),
      )
      .subscribe((commission) => this.commission.set(commission));
  }
}
