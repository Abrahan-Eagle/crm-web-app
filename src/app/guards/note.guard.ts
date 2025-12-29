import { Injectable, Signal } from '@angular/core';
import { CanDeactivate, GuardResult } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { hasPermission, Permissions, UserPermissionsService } from '@/utils';

export interface ComponentWithNote {
  registeredNote: Signal<boolean>;
  callNote(): void;
  requiredPermission: Permissions;
}

@Injectable()
export class CanDeactivateWithoutNote implements CanDeactivate<ComponentWithNote> {
  constructor(private readonly permissions: UserPermissionsService) {}

  async canDeactivate(component: ComponentWithNote): Promise<GuardResult> {
    await firstValueFrom(this.permissions.loadPermissions());
    const hasPerm = hasPermission([component.requiredPermission], this.permissions);
    if (hasPerm) {
      return true;
    }

    if (!component.registeredNote()) {
      component.callNote();
      return false;
    }

    return true;
  }
}
