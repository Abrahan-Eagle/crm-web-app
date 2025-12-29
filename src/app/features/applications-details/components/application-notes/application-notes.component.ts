import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';

import { NoteComponent } from '@/components';

import { ApplicationDetailsService } from '../../applications-details.service';

@Component({
  selector: 'app-application-notes',
  imports: [NoteComponent, NgOptimizedImage],
  templateUrl: './application-notes.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationNotesComponent {
  public readonly application = computed(() => this.detailsService.application());

  public readonly totalNotesCount = computed(() => {
    const companyNotesCount = this.detailsService.application()!.company.notes.length;

    const memberNotesCount = this.detailsService.application()!.company?.members?.reduce((count, member) => {
      return count + (member.contact.notes?.length || 0);
    }, 0);
    return companyNotesCount + memberNotesCount;
  });

  constructor(public readonly detailsService: ApplicationDetailsService) {}

  removeCompanyNote(noteId: string) {
    this.detailsService.application.set({
      ...this.detailsService.application()!,
      company: {
        ...this.detailsService.application()!.company,
        notes: this.detailsService.application()!.company.notes.filter((note) => note.id !== noteId),
      },
    });
  }

  removeNoteContact(noteId: string) {
    const application = this.detailsService.application();

    if (application && application.company && application.company.members) {
      const updatedMembers = application.company.members.map((member) => {
        if (member.contact) {
          const updatedNotes = member.contact.notes!.filter((note) => note.id !== noteId);

          return {
            ...member,
            contact: {
              ...member.contact,
              notes: updatedNotes,
            },
          };
        }
        return member;
      });

      this.detailsService.application.set({
        ...application,
        company: {
          ...application.company,
          members: updatedMembers,
        },
      });
    }
  }
}
