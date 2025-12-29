import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { finalize, mergeMap, of } from 'rxjs';

import { DraftsService } from '@/services';

@Component({
  selector: 'app-delete-draft',
  templateUrl: './delete-draft.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteDraftComponent {
  @Input({ required: true }) id!: string;

  @Output() draftDeleted = new EventEmitter<string | void>();

  public readonly loading = signal(false);

  constructor(private readonly draftsService: DraftsService) {}

  deleteDraft(): void {
    of(this.loading.set(true))
      .pipe(
        mergeMap(() => this.draftsService.deleteDraft(this.id)),
        finalize(() => this.loading.set(false)),
      )
      .subscribe(() => this.draftDeleted.emit(this.id));
  }
}
