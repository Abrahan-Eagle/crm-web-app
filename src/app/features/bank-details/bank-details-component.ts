import { AsyncPipe, CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { catchError, finalize, mergeMap, of } from 'rxjs';

import { CallablePhoneComponent, FilePickerComponent, ModalComponent, RemoteFileHandlerComponent } from '@/components';
import { Bank } from '@/interfaces';
import { AddressPipe, FormatPhonePipe, TextInitialsPipe } from '@/pipes';
import { BankService } from '@/services';
import { BusinessConfigService, ErrorHandlerService, Permissions, UserPermissionsService } from '@/utils';
import { fileNameFromURL, fileTypeFromURL } from '@/utils/function';

import {
  BankBlacklistComponent,
  BankOffersComponent,
  UpdateBankComponent,
  UpdateBankContactsComponent,
} from './components';

@Component({
  selector: 'app-bank-details',
  imports: [
    FormatPhonePipe,
    TextInitialsPipe,
    CurrencyPipe,
    NgOptimizedImage,
    UpdateBankComponent,
    UpdateBankContactsComponent,
    ModalComponent,
    FilePickerComponent,
    RemoteFileHandlerComponent,
    AddressPipe,
    AsyncPipe,
    CallablePhoneComponent,
    BankOffersComponent,
    BankBlacklistComponent,
  ],
  templateUrl: './bank-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BankDetailsComponent {
  @Input() set id(value: string) {
    this.getBank(value);
  }

  public readonly files = signal<{ type: string; source: string; name: string; id: string }[]>([]);

  public readonly loading = signal(true);

  public readonly uploadingDoc = signal(false);

  public readonly bank = signal<Bank | null>(null);

  public readonly permission = Permissions;

  constructor(
    private readonly bankService: BankService,
    public readonly config: BusinessConfigService,
    public readonly permissions: UserPermissionsService,
    private readonly errorHandlerService: ErrorHandlerService,
  ) {}

  public getBank(id: string): void {
    of(this.loading.set(true))
      .pipe(
        mergeMap(() => this.bankService.getBank(id, true)),
        finalize(() => this.loading.set(false)),
        catchError((error: HttpErrorResponse) =>
          this.errorHandlerService.resolveNotFound(error, '/banks', 'Bank not found'),
        ),
      )
      .subscribe((bank) => {
        this.bank.set(bank);
        this.files.set(
          bank.documents.map((document) => ({
            name: fileNameFromURL(document.url),
            source: document.url,
            type: fileTypeFromURL(document.url),
            id: document.id,
          })),
        );
      });
  }

  public updateBank(bank: Bank) {
    this.bank.set(bank);
  }

  public removeFile(fileId: string): void {
    this.uploadingDoc.set(true);
    this.bankService
      .removeFile(this.bank()!.id!, fileId)
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

  public addFile(files: File[]): void {
    const file = files.at(0);
    if (!file) {
      return;
    }

    this.uploadingDoc.set(true);
    this.bankService
      .addFile(this.bank()!.id!, file)
      .pipe(
        mergeMap(() => this.bankService.getBank(this.bank()!.id, false)),
        finalize(() => this.uploadingDoc.set(false)),
      )
      .subscribe((bank) => {
        if (!bank) {
          return;
        }

        this.bank.set(bank);

        this.files.set(
          bank.documents.map((document) => ({
            name: fileNameFromURL(document.url),
            source: document.url,
            type: fileTypeFromURL(document.url),
            id: document.id,
          })),
        );
      });
  }
}
