import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ModalService } from '@/utils';

import { CreateContactService } from '../../create-contact.service';

@Component({
  selector: 'app-contact-created',
  templateUrl: './contact-created.component.html',
  imports: [NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactCreatedComponent {
  constructor(
    public createContact: CreateContactService,
    public modal: ModalService,
  ) {}

  reset() {
    this.createContact.reset();
    this.modal.closeCurrent();
  }
}
