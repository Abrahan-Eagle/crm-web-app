import { AsyncPipe, CurrencyPipe, NgClass, NgOptimizedImage } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, Input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, finalize, map, mergeMap, of } from 'rxjs';

import { ModalComponent } from '@/components';
import { ApplicationDetails, ApplicationDocument, CompanyDetails } from '@/interfaces';
import { AddressPipe, FormatPhonePipe, TextInitialsPipe } from '@/pipes';
import { ApplicationsService } from '@/services';
import { BusinessConfigService, ErrorHandlerService, Permissions, UserPermissionsService } from '@/utils';
import { fileNameFromURL, fileTypeFromURL } from '@/utils/function';

import { ApplicationDetailsService } from './applications-details.service';
import {
  ApplicationDocumentComponent,
  ApplicationNotesComponent,
  BankHistoryComponent,
  BankNotificationsComponent,
  CompleteApplicationComponent,
  LeadTimeComponent,
  PositionSelectorComponent,
  RejectApplicationComponent,
  UpdateStatusComponent,
} from './components';
import { SendToBanksComponent } from './components/send-to-banks';

@Component({
  selector: 'app-applications-details',
  imports: [
    NgOptimizedImage,
    TextInitialsPipe,
    FormatPhonePipe,
    AddressPipe,
    AsyncPipe,
    ApplicationDocumentComponent,
    CurrencyPipe,
    RouterLink,
    SendToBanksComponent,
    BankNotificationsComponent,
    BankHistoryComponent,
    NgClass,
    ModalComponent,
    RejectApplicationComponent,
    CompleteApplicationComponent,
    ApplicationNotesComponent,
    LeadTimeComponent,
    PositionSelectorComponent,
    UpdateStatusComponent,
  ],
  templateUrl: './applications-details.component.html',
  providers: [ApplicationDetailsService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationsDetailsComponent {
  @Input() set id(value: string) {
    this.getApplication(value);
  }

  public readonly loading = signal(true);

  public readonly selectedTab = signal<'notifications' | 'history' | 'banks' | 'notes'>('notifications');

  public readonly permission = Permissions;

  public viewing = signal<ApplicationDetails | null>(null);

  public readonly application = computed(() => this.detailsService.application());

  public readonly totalNotesCount = computed(() => {
    const companyNotesCount = this.application()!.company.notes.length;

    const memberNotesCount = this.application()!.company?.members?.reduce((count, member) => {
      return count + (member.contact.notes?.length || 0);
    }, 0);
    return companyNotesCount + memberNotesCount;
  });

  constructor(
    private readonly applicationsService: ApplicationsService,
    public readonly detailsService: ApplicationDetailsService,
    public readonly config: BusinessConfigService,
    public readonly permissions: UserPermissionsService,
    private readonly errorHandlerService: ErrorHandlerService,
  ) {}

  private getApplication(id: string): void {
    of(this.loading.set(true))
      .pipe(
        mergeMap(() => this.applicationsService.getApplication(id, true)),
        finalize(() => this.loading.set(false)),
        catchError((error: HttpErrorResponse) =>
          this.errorHandlerService.resolveNotFound(error, '/applications', 'Application not found'),
        ),
        map((application) => ({
          ...application,
          mtd_statements: this.mapApplicationDocuments(application.mtd_statements),
          bank_statements: this.mapApplicationDocuments(application.bank_statements),
          additional_statements: this.mapApplicationDocuments(application.additional_statements),
          credit_card_statements: this.mapApplicationDocuments(application.credit_card_statements),
          filled_applications: this.mapApplicationDocuments(application.filled_applications),
          company: {
            ...application.company,
            documents: this.mapApplicationDocuments(application.company.documents),
          } as CompanyDetails & { documents: ApplicationDocument[] },
        })),
      )
      .subscribe((application) => {
        this.detailsService.application.set(application);
        if (application.status === 'READY_TO_SEND') {
          if (this.permissions.hasPermission(Permissions.AFFILIATED)) {
            this.selectedTab.set('notifications');
          } else {
            this.selectedTab.set('banks');
          }
        }
      });
  }

  updateSubStatus(substatus: string): void {
    this.detailsService.application.update((value) => {
      return { ...value!, substatus };
    });
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

  public changeTab(tab: 'notifications' | 'history' | 'banks' | 'notes'): void {
    this.selectedTab.set(tab);
  }

  public updateApplication(updated: ApplicationDetails): void {
    this.detailsService.application.update((value) => {
      return { ...value, ...updated };
    });

    this.selectedTab.set('notifications');
  }

  public onPositionUpdated(position: number): void {
    this.detailsService.application.update((value) => {
      return { ...value!, position };
    });
  }
}
