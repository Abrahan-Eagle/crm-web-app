import { ChangeDetectionStrategy, Component, computed, HostListener } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import NotificationAPI from 'notificationapi-js-client-sdk';
import { MarkAsReadModes, PopupPosition } from 'notificationapi-js-client-sdk/lib/interfaces';
import { filter } from 'rxjs';

import { environment } from '@/environments/environment';
import { MeService } from '@/services';

@Component({
  selector: 'app-user-notifications',
  imports: [],
  templateUrl: './user-notifications.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserNotificationsComponent {
  @HostListener('document:click', ['$event'])
  onClick() {
    if (this.isFirstClick && sessionStorage.getItem('isFirstTab')) {
      this.isFirstClick = false;
      localStorage.setItem('hasClicked', 'true');
      this.playNotificationSound();
    }
  }

  public readonly user = computed(() => this.meService.user());

  private notificationAPIInstance: NotificationAPI | null = null;

  private isFirstClick = false;

  constructor(private meService: MeService) {
    if (sessionStorage.getItem('isFirstTab')) {
      sessionStorage.setItem('isFirstTab', 'true');
    }

    toObservable(this.user)
      .pipe(filter((currentUser) => !!currentUser && !this.notificationAPIInstance))
      .subscribe((currentUser) => {
        this.notificationAPIInstance = new NotificationAPI({
          userId: currentUser!.id,
          clientId: environment.NOTIFICATION_API_CLIENT_ID,
        });
        this.notificationAPIInstance.showInApp({
          root: 'notifications-container',
          popupPosition: PopupPosition.BottomLeft,
          markAsReadMode: MarkAsReadModes.MANUAL,
        });

        if (this.notificationAPIInstance) {
          const originalNewNotificationsHandler = this.notificationAPIInstance.websocketHandlers.newNotifications;
          this.notificationAPIInstance.websocketHandlers.newNotifications = (message) => {
            if (originalNewNotificationsHandler) {
              originalNewNotificationsHandler(message);
            }
            this.playNotificationSound();
          };

          const originalUnreadCountHandler = this.notificationAPIInstance.websocketHandlers.unreadCount;
          this.notificationAPIInstance.websocketHandlers.unreadCount = (message) => {
            if (message.payload.count > 0) {
              this.isFirstClick = true;
            }

            originalUnreadCountHandler?.(message);
          };
        }
      });
  }

  private playNotificationSound() {
    const audio = new Audio('/assets/notification-sound.mp3');
    audio.play();
  }
}
