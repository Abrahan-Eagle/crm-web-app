import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { UserPermissionsService } from '@/utils';
import { hasPermission } from '@/utils/function';

import { UserActivityMonitorService } from './../utils/services/user-activity-monitor.service';

@Injectable({
  providedIn: 'root',
})
export class PermissionGuard implements CanActivate {
  constructor(
    private router: Router,
    private readonly permissions: UserPermissionsService,
    private readonly userActivity: UserActivityMonitorService,
  ) {}

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    await firstValueFrom(this.permissions.loadPermissions());

    const hasPerm = hasPermission(route.data?.['permissions'], this.permissions);
    if (!hasPerm && route.url.at(0)?.path !== 'applications') {
      this.userActivity.notifyNoAccess(route.url.toString());
      this.router.navigate(['/applications']);
    }
    return hasPerm;
  }
}
