import { AsyncPipe, NgOptimizedImage } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, Input, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, finalize, mergeMap, of } from 'rxjs';

import {
  CallablePhoneComponent,
  CreateNoteComponent,
  FilePickerComponent,
  ModalComponent,
  NoteComponent,
  RemoteFileHandlerComponent,
} from '@/components';
import { ComponentWithNote } from '@/guards';
import { Contact, Note } from '@/interfaces';
import { AddressPipe, CustomDatePipe, FormatPhonePipe, TextInitialsPipe, YearsAgoPipe } from '@/pipes';
import { ContactService } from '@/services';
import {
  BusinessConfigService,
  ErrorHandlerService,
  NotificationService,
  Permissions,
  UserPermissionsService,
} from '@/utils';
import { fileNameFromURL, fileTypeFromURL } from '@/utils/function';

import { ContactCompaniesComponent, UpdateAddressComponent, UpdateContactComponent } from './components';

@Component({
  selector: 'app-contact-details',
  imports: [
    FormsModule,
    TextInitialsPipe,
    NgOptimizedImage,
    ModalComponent,
    FormatPhonePipe,
    YearsAgoPipe,
    UpdateContactComponent,
    UpdateAddressComponent,
    FilePickerComponent,
    RemoteFileHandlerComponent,
    AddressPipe,
    AsyncPipe,
    CustomDatePipe,
    CreateNoteComponent,
    NoteComponent,
    CallablePhoneComponent,
    ContactCompaniesComponent,
  ],
  templateUrl: './contact-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactDetailsComponent implements ComponentWithNote {
  @ViewChild('createNote') createNote?: ModalComponent;

  @Input() set id(value: string) {
    this.getContact(value);
    this.contactId.set(value);
  }

  public readonly contactId = signal('');

  public readonly files = signal<{ type: string; source: string; name: string; id: string; docType: string }[]>([]);

  public readonly uploadingDoc = signal(false);

  public readonly contact = signal<Contact | null>(null);

  public readonly loading = signal(true);

  public readonly permission = Permissions;

  constructor(
    private readonly contactService: ContactService,
    public readonly config: BusinessConfigService,
    public readonly permissions: UserPermissionsService,
    public readonly notification: NotificationService,
    private readonly errorHandlerService: ErrorHandlerService,
  ) {}

  requiredPermission = Permissions.READ_CONTACT_WITHOUT_NOTE;

  readonly registeredNote = signal(false);

  callNote(): void {
    this.createNote?.open();
    this.notification.push({
      message: 'Please, before continuing, record a note with the reason for opening this contact.',
      type: 'info',
      delay: 8000,
    });
  }

  private getContact(id: string): void {
    of(this.loading.set(true))
      .pipe(
        mergeMap(() => this.contactService.getContact(id, true)),
        finalize(() => this.loading.set(false)),
        catchError((error: HttpErrorResponse) =>
          this.errorHandlerService.resolveNotFound(error, '/contacts', 'Contact not found'),
        ),
      )
      .subscribe((contact) => {
        this.contact.set(contact);
        const docs = contact?.documents ?? [];
        this.files.set(
          docs.map((document) => ({
            name: fileNameFromURL(document.url),
            source: document.url,
            type: fileTypeFromURL(document.url),
            id: document.id,
            docType: document.type,
          })),
        );
      });
  }

  updateContact(contact: Contact): void {
    this.contact.set(contact);
  }

  updateNotes(note: Note): void {
    this.contact.set({ ...this.contact()!, notes: [note, ...(this.contact()?.notes ?? [])] });
  }

  public removeFile(fileId: string): void {
    this.uploadingDoc.set(true);
    this.contactService
      .removeFile(this.contact()!.id!, fileId)
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
    this.contactService
      .addFile(this.contact()!.id!, (file?.docType ?? '').toLowerCase(), file)
      .pipe(
        mergeMap(() => this.contactService.getContact(this.contact()!.id)),
        finalize(() => this.uploadingDoc.set(false)),
      )
      .subscribe((contact) => {
        if (!contact) {
          return;
        }

        this.contact.set(contact);
        const docs = contact?.documents ?? [];
        this.files.set(
          docs.map((document) => ({
            name: fileNameFromURL(document.url),
            source: document.url,
            type: fileTypeFromURL(document.url),
            id: document.id,
            docType: document.type,
          })),
        );
      });
  }

  removeNote(noteId: string) {
    this.contact.set({ ...this.contact()!, notes: this.contact()!.notes.filter((note) => note.id !== noteId) });
  }
}
