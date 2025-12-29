import { Route } from '@angular/router';

import { PermissionGuard } from '@/guards';
import { Permissions } from '@/utils';

import { DashboardComponent } from './dashboard.component';

export default [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [PermissionGuard],
    data: {
      permissions: [Permissions.READ_DASHBOARD],
    },
  },

  { path: '**', redirectTo: '', pathMatch: 'full' },
] satisfies Route[];
