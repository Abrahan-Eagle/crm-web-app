import { inject } from '@angular/core';

import { Permissions } from '../permissions';
import { UserPermissionsService } from '../services';

export function hasPermission(permissions: Permissions[], service?: UserPermissionsService) {
  return (service ?? inject(UserPermissionsService)).permissions().some((per) => {
    return permissions.includes(per as Permissions);
  });
}
