import { DatePipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';

import { BankNotification } from '@/interfaces';
import { BusinessConfigService, Permissions, UserPermissionsService } from '@/utils';

@Component({
  selector: 'app-notification-view',
  imports: [NgClass, DatePipe],
  templateUrl: './notification-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationViewComponent {
  public readonly notification = input.required<BankNotification>();

  public readonly blocked = input.required<boolean>();

  public readonly config = inject(BusinessConfigService);

  public readonly onTap = output<void>();

  public readonly onReject = output<void>();

  public readonly permission = Permissions;

  constructor(public readonly permissions: UserPermissionsService) {}
}
