import { ChangeDetectionStrategy, Component } from '@angular/core';

import { NotificationService } from '@/utils/services';

import { ToastComponent } from './toast.component';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  imports: [ToastComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationComponent {
  constructor(public readonly notificationService: NotificationService) {}
}
