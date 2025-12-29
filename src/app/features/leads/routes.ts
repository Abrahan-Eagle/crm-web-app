import { Route } from '@angular/router';

import { PermissionGuard } from '@/guards';
import { Permissions } from '@/utils';

import { LeadsComponent } from './leads.component';

export default [
  {
    path: '',
    component: LeadsComponent,
    canActivate: [PermissionGuard],
    data: {
      permissions: [Permissions.LIST_LEADS, Permissions.LIST_OWN_LEADS],
    },
  },
  {
    path: 'create',
    loadComponent: () => import('@/features/create-lead').then((x) => x.CreateLeadComponent),
    canActivate: [PermissionGuard],
    data: {
      permissions: [Permissions.CREATE_LEAD],
    },
  },
  {
    path: ':id',
    loadComponent: () => import('@/features/prospects').then((x) => x.ProspectsComponent),
    canActivate: [PermissionGuard],
    data: {
      permissions: [Permissions.READ_LEAD],
    },
  },

  { path: '**', redirectTo: '', pathMatch: 'full' },
] satisfies Route[];
