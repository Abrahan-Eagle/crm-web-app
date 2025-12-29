import { computed, Injectable, signal } from '@angular/core';

import { APPLICATION_STATUS, ApplicationDetails, BankNotification } from '@/interfaces';

@Injectable({
  providedIn: 'root',
})
export class ApplicationDetailsService {
  public readonly application = signal<ApplicationDetails | null>(null);

  public readonly notifications = signal<BankNotification[]>([]);

  public readonly totalOffers = computed(() =>
    this.notifications().reduce((acc, notification) => acc + notification.offers.length, 0),
  );

  public readonly isBlocked = computed(
    () =>
      this.application() &&
      [APPLICATION_STATUS.COMPLETED, APPLICATION_STATUS.REJECTED].includes(this.application()!.status),
  );

  public readonly canItBeRejected = computed(
    () =>
      this.application() &&
      ![APPLICATION_STATUS.COMPLETED, APPLICATION_STATUS.REJECTED].includes(this.application()!.status),
  );
}
