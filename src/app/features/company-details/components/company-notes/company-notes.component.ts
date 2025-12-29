import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, signal, ViewChild } from '@angular/core';

import { CreateNoteComponent, ModalComponent, NoteComponent } from '@/components';
import { CompanyDetails, Note } from '@/interfaces';
import { Permissions, UserPermissionsService } from '@/utils';

@Component({
  selector: 'app-company-notes',
  imports: [ModalComponent, CreateNoteComponent, NoteComponent, NgOptimizedImage],
  templateUrl: './company-notes.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyNotesComponent {
  @Input({ required: true }) company!: CompanyDetails;

  public readonly permission = Permissions;

  @ViewChild('createNote') createNote?: ModalComponent;

  constructor(public readonly permissions: UserPermissionsService) {}

  public readonly registeredNote = signal(false);

  openModal(): void {
    this.createNote?.open();
  }

  public hasMemberNotes(): boolean {
    return this.company.members.some((member) => member.contact.notes!.length);
  }

  updateNotes(note: Note): void {
    const noteExists = this.company.notes.some((n: Note) => n.id === note.id);

    this.company = {
      ...this.company,
      notes: noteExists
        ? this.company.notes.map((n: Note) => (n.id === note.id ? note : n))
        : [...this.company.notes, note],
    };
    this.registeredNote.set(true);
  }

  removeNote(noteId: string) {
    const notes = this.company.notes.filter((note: Note) => note.id !== noteId);

    this.company = {
      ...this.company,
      notes,
    };
  }

  removeNoteContact(noteId: string) {
    const members = this.company.members.map((member: any) => {
      if (member.contact) {
        const notes = member.contact.notes.filter((note: Note) => note.id !== noteId);

        return {
          ...member,
          contact: {
            ...member.contact,
            notes,
          },
        };
      }
      return member;
    });

    this.company = {
      ...this.company,
      members,
    };
  }
}
