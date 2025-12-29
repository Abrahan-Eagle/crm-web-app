import { AsyncPipe, NgOptimizedImage } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, Input, signal, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, finalize, mergeMap, of } from 'rxjs';

import { CallablePhoneComponent, FilePickerComponent, RemoteFileHandlerComponent } from '@/components';
import { ComponentWithNote } from '@/guards';
import { CompanyDetails } from '@/interfaces';
import { AddressPipe, CustomDatePipe, FormatPhonePipe, TextInitialsPipe } from '@/pipes';
import { CompanyService } from '@/services';
import {
  BusinessConfigService,
  ErrorHandlerService,
  NotificationService,
  Permissions,
  UserPermissionsService,
} from '@/utils';
import { fileNameFromURL, fileTypeFromURL } from '@/utils/function';

import { CompanyApplicationsComponent, CompanyNotesComponent } from './components';

@Component({
  selector: 'app-company-details',
  imports: [
    TextInitialsPipe,
    NgOptimizedImage,
    FormatPhonePipe,
    FilePickerComponent,
    RemoteFileHandlerComponent,
    AddressPipe,
    AsyncPipe,
    CustomDatePipe,
    RouterLink,
    CompanyNotesComponent,
    CallablePhoneComponent,
    CompanyApplicationsComponent,
  ],
  templateUrl: './company-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyDetailsComponent implements ComponentWithNote {
  @ViewChild(CompanyNotesComponent) companyNotes?: CompanyNotesComponent;

  @Input() set id(value: string) {
    this.getCompany(value);
    this.companyId.set(value);
  }

  public readonly companyId = signal<string>('');

  public readonly files = signal<{ type: string; source: string; name: string; id: string; docType: string }[]>([]);

  public readonly uploadingDoc = signal(false);

  public readonly company = signal<CompanyDetails | null>(null);

  public readonly loading = signal(true);

  public readonly permission = Permissions;

  public readonly isEditing = signal(false);

  public readonly showContent = signal(true);

  public readonly canUploadMore = computed(
    () => this.files().length < this.config.maxCompanyFilePerType * Object.keys(this.config.companyFileTypes()).length,
  );

  requiredPermission = Permissions.READ_COMPANY_WITHOUT_NOTE;

  readonly registeredNote = computed(() => this.companyNotes?.registeredNote() ?? false);

  callNote(): void {
    if (!this.registeredNote()) {
      this.companyNotes?.openModal();
      this.notification.push({
        message: 'Please, before continuing, record a note with the reason for opening this company.',
        type: 'info',
        delay: 8000,
      });
    }
  }

  constructor(
    private readonly companyService: CompanyService,
    public readonly config: BusinessConfigService,
    public readonly permissions: UserPermissionsService,
    private readonly errorHandlerService: ErrorHandlerService,
    public readonly notification: NotificationService,
  ) {}

  private getCompany(id: string): void {
    of(this.loading.set(true))
      .pipe(
        mergeMap(() => this.companyService.getCompany(id, true)),
        finalize(() => this.loading.set(false)),
        catchError((error: HttpErrorResponse) =>
          this.errorHandlerService.resolveNotFound(error, '/companies', 'Company not found'),
        ),
      )
      .subscribe((company) => {
        this.company.set(company);
        this.files.set(
          company.documents.map((document) => ({
            name: fileNameFromURL(document.url),
            source: document.url,
            type: fileTypeFromURL(document.url),
            id: document.id,
            docType: document.type,
          })),
        );
      });
  }

  public removeFile(fileId: string): void {
    this.uploadingDoc.set(true);
    this.companyService
      .removeFile(this.company()!.id!, fileId)
      .pipe(finalize(() => this.uploadingDoc.set(false)))
      .subscribe(() => {
        this.files.update((files) => {
          const index = files.findIndex((doc) => doc.id === fileId);
          if (index !== -1) {
            files.splice(index, 1);
          }

          return files;
        });
      });
  }

  public addFile(files: (File & { docType?: string })[]): void {
    const file = files.at(0);
    if (!file) {
      return;
    }
    this.uploadingDoc.set(true);
    this.companyService
      .addFile(this.company()!.id!, file?.docType ?? 'OTHER', file)
      .pipe(
        mergeMap(() => this.companyService.getCompany(this.company()!.id)),
        finalize(() => this.uploadingDoc.set(false)),
      )
      .subscribe((company) => {
        if (!company) {
          return;
        }
        this.company.set(company);
        this.files.set(
          company.documents.map((document) => ({
            name: fileNameFromURL(document.url),
            source: document.url,
            type: fileTypeFromURL(document.url),
            id: document.id,
            docType: document.type,
          })),
        );
      });
  }
}
