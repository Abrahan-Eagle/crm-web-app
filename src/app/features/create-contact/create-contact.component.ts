import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Contact } from '@/interfaces';

import {
  ContactAddressComponent,
  ContactBasicInformationComponent,
  ContactCreatedComponent,
  ContactNotesComponent,
  UploadContactDocumentsComponent,
} from './components';
import { CreateContactService } from './create-contact.service';

@Component({
  selector: 'app-create-contact',
  imports: [
    ContactBasicInformationComponent,
    NgClass,
    ContactAddressComponent,
    UploadContactDocumentsComponent,
    ContactCreatedComponent,
    ContactNotesComponent,
  ],
  templateUrl: './create-contact.component.html',
  providers: [CreateContactService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateContactComponent {
  @Input() shouldEmit = false;

  @Output() contactCreated = new EventEmitter<Contact>();

  constructor(public readonly formService: CreateContactService) {
    formService.contactCreated.pipe(takeUntilDestroyed()).subscribe((contact) => {
      if (this.shouldEmit) {
        this.formService.reset();
        this.contactCreated.emit(contact);
      }
    });
  }
}
