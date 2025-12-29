import { Route } from '@angular/router';

import { PermissionGuard } from '@/guards';
import { Permissions } from '@/utils';

import { DraftApplicationsComponent } from './draft-applications.component';

export default [
  {
    path: '',
    component: DraftApplicationsComponent,
    canActivate: [PermissionGuard],
    data: {
      permissions: [Permissions.LIST_DRAFT_APPLICATIONS, Permissions.LIST_OWN_DRAFT_APPLICATIONS],
    },
  },
  {
    path: ':id',
    loadComponent: () => import('@/features/draft-details').then((x) => x.DraftDetailsComponent),
    canActivate: [PermissionGuard],
    data: {
      permissions: [Permissions.READ_DRAFT_APPLICATION, Permissions.READ_OWN_DRAFT_APPLICATION],
    },
  },
  { path: '**', redirectTo: '', pathMatch: 'full' },
] satisfies Route[];
