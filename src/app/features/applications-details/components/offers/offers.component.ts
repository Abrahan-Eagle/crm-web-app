import { CurrencyPipe, DatePipe, NgClass, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, input, output, signal } from '@angular/core';
import { finalize, mergeMap, of } from 'rxjs';

import { ModalComponent } from '@/components';
import { APPLICATION_STATUS, BankNotification, BankNotificationStatus, Offer } from '@/interfaces';
import { ApplicationsService } from '@/services';
import { BusinessConfigService, Permissions, UserPermissionsService } from '@/utils';

import { ApplicationDetailsService } from '../../applications-details.service';
import { CreateOfferComponent } from '../create-offer';
import { RestoreOfferComponent } from '../restore-offer';
import { UpdateOfferComponent } from '../update-offer';

@Component({
  selector: 'app-offers',
  imports: [
    NgOptimizedImage,
    CurrencyPipe,
    CreateOfferComponent,
    NgClass,
    ModalComponent,
    UpdateOfferComponent,
    DatePipe,
    RestoreOfferComponent,
  ],
  templateUrl: './offers.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OffersComponent {
  @Input({ required: true }) public notification!: BankNotification;

  public readonly restored = output<void>();

  public readonly allowCreate = input(true);

  public readonly permission = Permissions;

  public readonly loading = signal(false);

  public viewing = signal<Offer | null>(null);

  constructor(
    public readonly details: ApplicationDetailsService,
    public readonly config: BusinessConfigService,
    public readonly permissions: UserPermissionsService,
    private readonly applicationService: ApplicationsService,
  ) {}

  public addOffer(offer: Offer): void {
    this.details.notifications.update((notifications) => {
      const index = notifications.findIndex((notification) => notification.id === this.notification.id);
      if (index > -1) {
        notifications[index].offers.push(offer);

        notifications[index].status = BankNotificationStatus.OFFERED;
      }

      return [...notifications];
    });

    this._syncAppStatus();
  }

  public updateOffer(offer: Offer): void {
    this.notification.offers = this.notification.offers.map((o) => (o.id === offer.id ? offer : o));
  }

  public acceptOffer(offerId: string): void {
    of(this.loading.set(true))
      .pipe(
        mergeMap(() =>
          this.applicationService.acceptOffer(this.details.application()!.id, this.notification.id, offerId),
        ),
        finalize(() => this.loading.set(false)),
      )
      .subscribe(() => {
        this.details.notifications.set(
          this.details.notifications().map((notification) => {
            if (notification.id === this.notification.id) {
              const offer = notification.offers.find((offer) => offer.id === offerId);
              if (offer) {
                offer.status = 'ACCEPTED';
              }
              notification.status = BankNotificationStatus.ACCEPTED;
            }

            return notification;
          }),
        );
        this._syncAppStatus();
      });
  }

  public cancelOffer(offerId: string): void {
    of(this.loading.set(true))
      .pipe(
        mergeMap(() =>
          this.applicationService.cancelOffer(this.details.application()!.id, this.notification.id, offerId),
        ),
        finalize(() => this.loading.set(false)),
      )
      .subscribe(() => {
        this.details.notifications.set(
          this.details.notifications().map((notification) => {
            if (notification.id === this.notification.id) {
              const offer = notification.offers.find((offer) => offer.id === offerId);
              if (offer) {
                offer.status = 'ON_HOLD';
              }

              notification.status =
                notification.offers.filter((offer) => offer.id !== offerId && offer.status === 'ACCEPTED').length > 0
                  ? BankNotificationStatus.ACCEPTED
                  : BankNotificationStatus.OFFERED;
            }

            return notification;
          }),
        );
        this._syncAppStatus();
      });
  }

  private _syncAppStatus(): void {
    // Update the status based on the notifications
    const application = this.details.application();
    const notifications = this.details.notifications();
    if (application && application!.status !== 'REJECTED') {
      if (notifications.some((notification) => notification.status === BankNotificationStatus.ACCEPTED)) {
        this.details.application.set({ ...application!, status: APPLICATION_STATUS.OFFER_ACCEPTED });
      } else if (notifications.some((notification) => notification.status === BankNotificationStatus.OFFERED)) {
        this.details.application.set({ ...application!, status: APPLICATION_STATUS.OFFERED });
      }
    }
  }
}
