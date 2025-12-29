import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, tap } from 'rxjs';

import { DraftsService } from '@/services';

@Component({
  selector: 'app-publish-draft',
  imports: [],
  templateUrl: './publish-draft.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublishDraftComponent {
  @Input({ required: true }) draftId!: string;

  public readonly loading = signal(false);

  @Output() draftPublished = new EventEmitter<void>();

  constructor(
    private readonly draftsService: DraftsService,
    private readonly router: Router,
  ) {}

  publishDraft() {
    this.loading.set(true);
    this.draftsService
      .publishDraft(this.draftId)
      .pipe(
        finalize(() => this.loading.set(false)),
        tap(() => this.draftPublished.emit()),
      )
      .subscribe(() => this.router.navigate(['applications']));
  }
}
