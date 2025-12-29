import { ChangeDetectionStrategy, Component, input, OnChanges, OnInit, output, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { RemoteFileHandlerComponent } from '@/components/inputs/files/remote-file-handler';
import { EmailFacadeService } from '@/features/send-email-to-banks/email-facade.service';
import { EntityDocument, EntityWithDocuments, SelectedAttachment } from '@/interfaces';

@Component({
  selector: 'app-attachment-viewer',
  imports: [RemoteFileHandlerComponent],
  templateUrl: './attachment-viewer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttachmentViewerComponent implements OnInit, OnChanges {
  public readonly entity = input.required<EntityWithDocuments>();

  public readonly documentSelected = output<SelectedAttachment>();

  public readonly documents = signal<EntityDocument[]>([]);

  public readonly selectedDocuments = input<string[]>();

  protected readonly selectedDocumentsSet = signal<Set<string>>(new Set());

  public readonly loading = signal(false);

  constructor(private readonly emailService: EmailFacadeService) {}

  ngOnChanges(): void {
    this.selectedDocumentsSet.set(new Set(this.selectedDocuments()));
  }

  ngOnInit(): void {
    this.loading.set(true);
    this.emailService
      .getEntityDocuments(this.entity().type, this.entity().id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((documents) => this.documents.set(documents));
  }

  public onCheckboxChange(document: EntityDocument): void {
    this.documentSelected.emit({
      document_id: document.id,
      entity_id: this.entity().id,
      entity_type: this.entity().type,
      document_name: document.name,
      file_type: document.file_type,
      source: document.url,
    });
  }
}
