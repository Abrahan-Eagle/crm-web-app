import { AsyncPipe, NgOptimizedImage } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '@auth0/auth0-angular';
import * as Sentry from '@sentry/browser';
import { delayWhen, filter, tap } from 'rxjs';

import { PhoneCallModalComponent } from './components';
import { LayoutComponent } from './layout';
import { UserActivityMonitorService, UserPermissionsService } from './utils';

@Component({
  selector: 'app-root',
  styles: [
    `
      html,
      body {
        height: 100%;
      }
    `,
  ],
  imports: [LayoutComponent, AsyncPipe, NgOptimizedImage, PhoneCallModalComponent],
  templateUrl: './app.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
  public loading = toSignal(
    this.auth.user$
      .pipe(
        filter((user) => !!user),
        tap((user) => {
          const tenants = (user?.['tenants'] ?? []) as string[];
          const tenant = window.localStorage.getItem('tenant_id');

          if (!tenant || !tenants.includes(tenant)) {
            window.localStorage.setItem('tenant_id', tenants[0]);
            return;
          }

          Sentry.setUser({ email: user!.email! });
          Sentry.setExtras({ tenant_id: tenant });
        }),
      )
      .pipe(delayWhen(() => this.permissions.loadPermissions())),
  );

  constructor(
    public readonly auth: AuthService,
    private readonly permissions: UserPermissionsService,
    private readonly activty: UserActivityMonitorService,
  ) {}
}
