import { CurrencyPipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';

import { ModalComponent, RemoteFileVysorComponent } from '@/components';
import { DecodeUriPipe } from '@/pipes';
import { Permissions, UserPermissionsService } from '@/utils';

@Component({
  selector: 'app-application-document',
  imports: [NgClass, ModalComponent, RemoteFileVysorComponent, CurrencyPipe, DecodeUriPipe],
  templateUrl: './application-document.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationDocumentComponent {
  public readonly showFile = signal(false);

  @Input({ required: true }) name!: string;

  @Input({ required: true }) type!: string;

  @Input() docType?: string;

  @Input({ required: true }) source!: string;

  @Input() amount: number | undefined;

  @Input() negative_days: number | undefined;

  @Input() transactions: number | undefined;

  public readonly permission = Permissions;

  constructor(public readonly permissions: UserPermissionsService) {}

  public openVysor(): void {
    // Known bug: If when instantiating the PDF viewer there is no height or width, it will not be displayed later
    this.showFile.set(true);
  }
}
