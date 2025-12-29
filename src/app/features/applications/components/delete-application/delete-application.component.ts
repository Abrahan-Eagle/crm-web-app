import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { finalize, mergeMap, of } from 'rxjs';

import { ApplicationsService } from '@/services';

@Component({
  selector: 'app-delete-application',
  templateUrl: './delete-application.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteApplicationComponent {
  @Input({ required: true }) id!: string;

  @Output() applicationDeleted = new EventEmitter<string | void>();

  public readonly loading = signal(false);

  constructor(private readonly applicationsService: ApplicationsService) {}

  removeApplication(): void {
    of(this.loading.set(true))
      .pipe(
        mergeMap(() => this.applicationsService.removeApplication(this.id)),
        finalize(() => this.loading.set(false)),
      )
      .subscribe(() => this.applicationDeleted.emit(this.id));
  }
}
