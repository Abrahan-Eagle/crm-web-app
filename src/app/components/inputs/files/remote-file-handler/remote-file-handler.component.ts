import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';

import { ModalComponent } from '@/components/modal';
import { Permissions, UserPermissionsService } from '@/utils';

import { RemoteFileVysorComponent } from '../remote-file-vysor';

@Component({
  selector: 'app-remote-file-handler',
  imports: [NgClass, ModalComponent, RemoteFileVysorComponent],
  templateUrl: './remote-file-handler.component.html',
})
export class RemoteFileHandlerComponent {
  public readonly showFile = signal(false);

  @Input({ required: true }) name!: string;

  @Input({ required: true }) type!: string;

  @Input({ required: true }) source!: string;

  @Input() withDocType = false;

  @Input() docType: string | null = null;

  @Input() showDelete = true;

  @Output() public readonly deleted = new EventEmitter<void>();

  public readonly permission = Permissions;

  constructor(public readonly permissions: UserPermissionsService) {}

  public openVysor(): void {
    // Known bug: If when instantiating the PDF viewer there is no height or width, it will not be displayed later
    this.showFile.set(true);
  }
}
