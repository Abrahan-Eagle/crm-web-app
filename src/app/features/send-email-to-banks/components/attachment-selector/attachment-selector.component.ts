import { TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { EmailFacadeService } from '@/features/send-email-to-banks/email-facade.service';
import { EntityWithDocuments, SelectedAttachment } from '@/interfaces';
import { SearchModel } from '@/models';
import { TextInitialsPipe } from '@/pipes';
import { SearchService, WithSearchable } from '@/utils';

import { AttachmentViewerComponent } from '../attachment-viewer/attachment-viewer.component';

@Component({
  selector: 'app-attachment-selector',
  imports: [FormsModule, TextInitialsPipe, TitleCasePipe, AttachmentViewerComponent],
  templateUrl: './attachment-selector.component.html',
  providers: [SearchService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttachmentSelectorComponent extends WithSearchable {
  public readonly documentsSelected = output<SelectedAttachment[]>();

  public searchTerm = '';

  public readonly activeTab = signal<'company' | 'contact'>('company');

  public readonly loading = signal(false);

  public readonly entities = signal<EntityWithDocuments[]>([]);

  public readonly documents = signal<Map<string, SelectedAttachment>>(new Map());

  // A signal, instead of a computed, because signals don't track well with Map
  public readonly selectedDocumentsKeys = signal<string[]>([]);

  public readonly nothingFound = signal(false);

  public readonly expandedEntities = signal<Set<string>>(new Set());

  constructor(private readonly emailService: EmailFacadeService) {
    super();
  }

  override onSearch(): void {
    this.loadEntities();
  }

  public setActiveTab(tab: 'company' | 'contact'): void {
    this.searchTerm = '';
    this.activeTab.set(tab);
    this.entities.set([]);
  }

  public onDocumentSelected(attachment: SelectedAttachment): void {
    const documents = this.documents();

    documents.has(attachment.document_id)
      ? documents.delete(attachment.document_id)
      : documents.set(attachment.document_id, attachment);

    this.documents.set(documents);
    this.selectedDocumentsKeys.set(Array.from(this.documents().keys()));
  }

  public toggleExpanded(id: string): void {
    const expanded = this.expandedEntities();
    expanded.has(id) ? expanded.delete(id) : expanded.add(id);
    this.expandedEntities.set(expanded);
  }

  private loadEntities(): void {
    this.loading.set(true);
    this.nothingFound.set(false);
    this.expandedEntities.set(new Set());

    this.emailService
      .searchEntities(this.activeTab(), SearchModel.EMPTY.copyWith({ search: this.searchTerm.trim() }))
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((entities) => {
        this.entities.set(entities);
        this.nothingFound.set(entities.length === 0);
      });
  }

  emitSelection(emitValues = true) {
    this.documentsSelected.emit(emitValues ? Array.from(this.documents().values()) : []);
    this.entities.set([]);
    this.selectedDocumentsKeys.set([]);
    this.documents.set(new Map());
    this.expandedEntities.set(new Set());
    this.searchTerm = '';
  }
}
