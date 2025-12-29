import { Route } from '@angular/router';

import { PermissionGuard } from '@/guards';
import { Permissions } from '@/utils';

import { ApplicationsComponent } from './applications.component';

export default [
  {
    path: '',
    component: ApplicationsComponent,
    canActivate: [PermissionGuard],
    data: {
      permissions: [Permissions.LIST_APPLICATIONS, Permissions.LIST_OWN_APPLICATIONS],
    },
  },
  {
    path: 'create',
    loadComponent: () => import('@/features/create-application').then((x) => x.CreateApplicationsComponent),
    canActivate: [PermissionGuard],
    data: {
      permissions: [Permissions.CREATE_APPLICATION],
    },
  },
  {
    path: ':id',
    loadComponent: () => import('@/features/applications-details').then((x) => x.ApplicationsDetailsComponent),
    canActivate: [PermissionGuard],
    data: {
      permissions: [Permissions.READ_APPLICATION, Permissions.READ_OWN_APPLICATION],
    },
  },
  { path: '**', redirectTo: '', pathMatch: 'full' },
] satisfies Route[];
