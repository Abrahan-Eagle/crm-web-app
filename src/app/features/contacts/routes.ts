import { Route } from '@angular/router';

import { CanDeactivateWithoutNote, PermissionGuard } from '@/guards';
import { Permissions } from '@/utils';

import { ContactsComponent } from './contacts.component';

export default [
  {
    path: '',
    component: ContactsComponent,
    canActivate: [PermissionGuard],
    data: {
      permissions: [Permissions.LIST_CONTACTS, Permissions.LIST_OWN_CONTACTS],
    },
  },
  {
    path: ':id',
    loadComponent: () => import('@/features/contact-details').then((x) => x.ContactDetailsComponent),
    canActivate: [PermissionGuard],
    canDeactivate: [CanDeactivateWithoutNote],
    providers: [CanDeactivateWithoutNote],
    data: {
      permissions: [Permissions.READ_CONTACT, Permissions.READ_OWN_CONTACT],
    },
  },
  { path: '**', redirectTo: '', pathMatch: 'full' },
] satisfies Route[];
