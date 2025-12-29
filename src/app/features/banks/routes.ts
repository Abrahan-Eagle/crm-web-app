import { Route } from '@angular/router';

import { PermissionGuard } from '@/guards';
import { Permissions } from '@/utils';

import { BanksComponent } from './banks.component';

export default [
  {
    path: '',
    component: BanksComponent,
    canActivate: [PermissionGuard],
    data: {
      permissions: [Permissions.LIST_BANKS],
    },
  },
  {
    path: ':id',
    loadComponent: () => import('@/features/bank-details').then((x) => x.BankDetailsComponent),
    canActivate: [PermissionGuard],
    data: {
      permissions: [Permissions.READ_BANK],
    },
  },
  { path: '**', redirectTo: '', pathMatch: 'full' },
] satisfies Route[];
