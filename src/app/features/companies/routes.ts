import { Route } from '@angular/router';

import { CanDeactivateWithoutNote, PermissionGuard } from '@/guards';
import { Permissions } from '@/utils';

import { CompaniesComponent } from './companies.component';

export default [
  {
    path: '',
    component: CompaniesComponent,
    canActivate: [PermissionGuard],
    data: {
      permissions: [Permissions.LIST_COMPANIES, Permissions.LIST_OWN_COMPANIES],
    },
  },
  {
    path: 'create',
    loadComponent: () => import('@/features/create-company').then((x) => x.CreateCompanyComponent),
    canActivate: [PermissionGuard],
    data: {
      permissions: [Permissions.CREATE_COMPANY],
    },
  },
  {
    path: ':id/details',
    loadComponent: () =>
      import('@/features/company-details/components/update-company-details').then(
        (x) => x.UpdateCompanyDetailsComponent,
      ),
    canActivate: [PermissionGuard],
    data: {
      permissions: [Permissions.UPDATE_COMPANY],
    },
  },
  {
    path: ':id/members',
    loadComponent: () =>
      import('@/features/company-details/components/update-company-members').then(
        (x) => x.UpdateCompanyMembersComponent,
      ),
    canActivate: [PermissionGuard],
    data: {
      permissions: [Permissions.UPDATE_COMPANY],
    },
  },
  {
    path: ':id',
    loadComponent: () => import('@/features/company-details').then((x) => x.CompanyDetailsComponent),
    canActivate: [PermissionGuard],
    canDeactivate: [CanDeactivateWithoutNote],
    providers: [CanDeactivateWithoutNote],
    data: {
      permissions: [Permissions.READ_COMPANY, Permissions.READ_OWN_COMPANY],
    },
  },
  { path: '**', redirectTo: '', pathMatch: 'full' },
] satisfies Route[];
