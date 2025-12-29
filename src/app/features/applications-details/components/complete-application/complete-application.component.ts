import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { finalize, mergeMap, of } from 'rxjs';

import { ApplicationsService } from '@/services';

@Component({
  selector: 'app-complete-application',
  imports: [],
  templateUrl: './complete-application.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompleteApplicationComponent {
  @Input() public id!: string;

  public readonly loading = signal(true);

  constructor(public readonly applicationService: ApplicationsService) {}

  public completeApplication(): void {
    of(this.loading.set(true))
      .pipe(
        mergeMap(() => this.applicationService.completeApplication(this.id)),
        finalize(() => this.loading.set(false)),
      )
      .subscribe(() => {
        window.location.reload();
      });
  }
}
