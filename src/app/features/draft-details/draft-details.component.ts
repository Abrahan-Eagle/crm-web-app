import { AsyncPipe, CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, finalize, map, mergeMap, of } from 'rxjs';

import { ModalComponent } from '@/components';
import { ApplicationDocument, CompanyDetails, DraftDetails } from '@/interfaces';
import { AddressPipe, FormatPhonePipe, TextInitialsPipe } from '@/pipes';
import { DraftsService } from '@/services';
import { BusinessConfigService, ErrorHandlerService, Permissions, UserPermissionsService } from '@/utils';
import { fileNameFromURL, fileTypeFromURL } from '@/utils/function';

import { ApplicationDocumentComponent, PublishDraftComponent, UpdateDocumentsComponent } from './components';

@Component({
  selector: 'app-draft-details',
  imports: [
    NgOptimizedImage,
    TextInitialsPipe,
    FormatPhonePipe,
    AddressPipe,
    AsyncPipe,
    ApplicationDocumentComponent,
    PublishDraftComponent,
    UpdateDocumentsComponent,
    ModalComponent,
    CurrencyPipe,
    RouterLink,
  ],
  templateUrl: './draft-details.component.html',
  providers: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DraftDetailsComponent {
  @Input() set id(value: string) {
    this.getApplication(value);
  }

  public readonly loading = signal(true);

  public readonly permission = Permissions;

  public viewing = signal<DraftDetails | null>(null);

  constructor(
    private readonly draftsService: DraftsService,
    public readonly config: BusinessConfigService,
    public readonly permissions: UserPermissionsService,
    private readonly errorHandlerService: ErrorHandlerService,
  ) {}

  private getApplication(id: string): void {
    of(this.loading.set(true))
      .pipe(
        mergeMap(() => this.draftsService.getDraft(id)),
        finalize(() => this.loading.set(false)),
        catchError((error: HttpErrorResponse) =>
          this.errorHandlerService.resolveNotFound(error, '/drafts', 'Draft not found'),
        ),
        map((draft) => ({
          ...draft,
          bank_statements: this.mapApplicationDocuments(draft.bank_statements),
          company: {
            ...draft.company,
            documents: this.mapApplicationDocuments(draft.company.documents),
          } as CompanyDetails & { documents: ApplicationDocument[] },
        })),
      )
      .subscribe((draft) => this.viewing.set(draft));
  }

  private mapApplicationDocuments(docs: ApplicationDocument[] = []): ApplicationDocument[] {
    return docs.map((doc) => ({
      period: doc.period,
      url: doc.url,
      name: fileNameFromURL(doc.url),
      source: doc.url,
      amount: doc.amount,
      negative_days: doc.negative_days,
      transactions: doc.transactions,
      type: fileTypeFromURL(doc.url),
      docType: doc.type,
    }));
  }
}
