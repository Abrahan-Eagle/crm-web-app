import { NgClass, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal, ViewChild } from '@angular/core';
import { finalize, iif, mergeMap, of } from 'rxjs';

import { Note } from '@/interfaces';
import { CustomDatePipe } from '@/pipes';
import { ContactService } from '@/services';
import { CompanyService } from '@/services/company.service';
import { BusinessConfigService, Permissions, UserPermissionsService } from '@/utils';

import { ModalComponent } from '../modal';

@Component({
  selector: 'app-note',
  imports: [CustomDatePipe, ModalComponent, NgOptimizedImage, NgClass],
  templateUrl: './note.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoteComponent {
  @ViewChild('deleteNote') deleteNoteModal?: ModalComponent;

  @Input({ required: true }) note!: Note;

  @Input({ required: true }) entityId!: string;

  @Input({ required: true }) entityType!: 'contact' | 'company';

  @Output() deleted = new EventEmitter<void>();

  public readonly loading = signal(false);

  public readonly expanded = signal(false);

  public readonly permission = Permissions;

  constructor(
    public readonly config: BusinessConfigService,
    public readonly contactService: ContactService,
    public readonly companyService: CompanyService,
    public readonly permissions: UserPermissionsService,
  ) {}

  public removeNote() {
    of(this.loading.set(true))
      .pipe(
        mergeMap(() =>
          iif(
            () => this.entityType === 'contact',
            this.contactService.removeNote(this.entityId, this.note.id),
            this.companyService.removeNote(this.entityId, this.note.id),
          ),
        ),
        finalize(() => this.loading.set(false)),
      )
      .subscribe(() => {
        this.deleteNoteModal?.close();
        return this.deleted.emit();
      });
  }
}
