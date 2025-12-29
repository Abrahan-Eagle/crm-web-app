import { Route } from '@angular/router';

import { PermissionGuard } from '@/guards';
import { Permissions } from '@/utils';

import { UsersComponent } from './users.component';

export default [
  {
    path: '',
    component: UsersComponent,
    canActivate: [PermissionGuard],
    data: {
      permissions: [Permissions.LIST_USER],
    },
  },

  { path: '**', redirectTo: '', pathMatch: 'full' },
] satisfies Route[];
