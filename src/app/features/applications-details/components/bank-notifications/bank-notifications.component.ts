import { DatePipe, DecimalPipe, NgClass, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { ModalComponent } from '@/components';
import { BankNotification, BankNotificationStatus } from '@/interfaces';
import { ApplicationsService } from '@/services';
import { BusinessConfigService } from '@/utils';

import { ApplicationDetailsService } from '../../applications-details.service';
import { OffersComponent } from '../offers';
import { RejectNotificationComponent } from '../reject-notification';
import { NotificationViewComponent } from './components';

@Component({
  selector: 'app-bank-notifications',
  imports: [
    NgOptimizedImage,
    DecimalPipe,
    RejectNotificationComponent,
    ModalComponent,
    OffersComponent,
    NotificationViewComponent,
    NgClass,
    DatePipe,
  ],
  templateUrl: './bank-notifications.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BankNotificationsComponent {
  public readonly onlyOffers = signal(false);

  public readonly notifications = computed(() => {
    return this.onlyOffers()
      ? this.details
          .notifications()
          .filter(
            (notification) =>
              notification.offers.length &&
              [BankNotificationStatus.ACCEPTED, BankNotificationStatus.OFFERED].includes(notification.status),
          )
      : this.details.notifications();
  });

  public readonly groupedNotifications = signal<
    {
      date: string;
      items: BankNotification[];
    }[]
  >([]);

  public readonly loading = signal(true);

  public readonly editingNotification = signal<BankNotification | null>(null);

  public readonly viewing = signal<BankNotification | null>(null);

  constructor(
    private readonly applicationsService: ApplicationsService,
    public readonly details: ApplicationDetailsService,
    public readonly config: BusinessConfigService,
  ) {
    this.getNotifications();
  }

  public getNotifications(): void {
    this.applicationsService
      .getNotifications(this.details.application()!.id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((data) => {
        const updatedNotifications = data.map((notification: BankNotification) => {
          if (notification.status === BankNotificationStatus.SENT && notification.offers.length > 0) {
            notification.status = BankNotificationStatus.OFFERED;
          }
          return notification;
        });
        this.details.notifications.set(updatedNotifications);
        this._groupNotifications();
      });
  }

  public updateNotification(updated: BankNotification): void {
    const notifications = this.details.notifications();
    const index = notifications.findIndex((notification) => notification.id === updated.id);

    if (index > -1) {
      notifications[index] = updated;
    }

    this.details.notifications.set(notifications);
    this._groupNotifications();

    this.editingNotification.set(null);
  }

  public restore(): void {
    if (this.viewing()) {
      this.updateNotification({
        ...this.viewing()!,
        reject_reason_description: null,
        status: BankNotificationStatus.SENT,
      });

      this.viewing.set(null);
    }
  }

  private _groupNotifications() {
    const groups = this.details.notifications().reduce((acc, notification) => {
      const dateKey = new Date(notification.created_at).toISOString().slice(0, 16);

      const group = acc as Record<string, BankNotification[]>;

      if (!group[dateKey]) {
        group[dateKey] = [] as BankNotification[];
      }

      group[dateKey].push(notification);
      return acc;
    }, {});

    this.groupedNotifications.set(
      Object.entries(groups).map(([date, items]) => ({
        date,
        items,
      })) as {
        date: string;
        items: BankNotification[];
      }[],
    );
  }
}
