import { Routes } from '@angular/router';
import { AuthGuard } from '@auth0/auth0-angular';

import { PermissionGuard } from './guards';
import { Permissions } from './utils';

export const routes: Routes & {
  data?: any & { icon?: string; name?: string; permissions?: string };
} = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('@/features/dashboard/routes'),
        canActivate: [PermissionGuard],
        data: {
          icon: '/assets/icons/menu_dashboard.svg',
          name: 'Dashboard',
          permissions: [Permissions.READ_DASHBOARD],
        },
      },
      {
        path: 'applications',
        loadChildren: () => import('@/features/applications/routes'),
        canActivate: [PermissionGuard],
        data: {
          icon: '/assets/icons/menu_applications.svg',
          name: 'Applications',
          permissions: [Permissions.LIST_APPLICATIONS, Permissions.LIST_OWN_APPLICATIONS],
        },
      },
      {
        path: 'drafts',
        loadChildren: () => import('@/features/draft-applications/routes'),
        canActivate: [PermissionGuard],
        data: {
          icon: '/assets/icons/menu_applications.svg',
          name: 'Drafts',
          permissions: [Permissions.LIST_DRAFT_APPLICATIONS, Permissions.LIST_OWN_DRAFT_APPLICATIONS],
        },
      },
      {
        path: 'contacts',
        loadChildren: () => import('@/features/contacts/routes'),
        canActivate: [PermissionGuard],
        data: {
          icon: '/assets/icons/menu_contacts.svg',
          name: 'Contacts',
          permissions: [Permissions.LIST_CONTACTS, Permissions.LIST_OWN_CONTACTS],
        },
      },
      {
        path: 'companies',
        loadChildren: () => import('@/features/companies/routes'),
        canActivate: [PermissionGuard],
        data: {
          icon: '/assets/icons/menu_companies.svg',
          name: 'Companies',
          permissions: [Permissions.LIST_COMPANIES, Permissions.LIST_OWN_COMPANIES],
        },
      },
      {
        path: 'banks',
        loadChildren: () => import('@/features/banks/routes'),
        canActivate: [PermissionGuard],
        data: {
          icon: '/assets/icons/menu_banks.svg',
          name: 'Banks',
          permissions: [Permissions.LIST_BANKS],
        },
      },
      {
        path: 'commissions',
        loadChildren: () => import('@/features/commissions/routes'),
        canActivate: [PermissionGuard],
        data: {
          icon: '/assets/icons/menu_commissions.svg',
          name: 'Commissions',
          permissions: [Permissions.LIST_COMMISSIONS],
        },
      },
      {
        path: 'users',
        loadChildren: () => import('@/features/users/routes'),
        canActivate: [PermissionGuard],
        data: {
          icon: '/assets/icons/menu_contacts.svg',
          name: 'Users',
          permissions: [Permissions.LIST_USER],
        },
      },
      {
        path: 'update-profile',
        loadComponent: () =>
          import('@/features/update-profile/update-profile.component').then((c) => c.UpdateProfileComponent),
      },
      {
        path: 'leads',
        loadChildren: () => import('@/features/leads/routes'),
        canActivate: [PermissionGuard],
        data: {
          icon: '/assets/icons/menu_leads.svg',
          name: 'Leads',
          permissions: [Permissions.LIST_LEADS, Permissions.LIST_OWN_LEADS],
        },
      },
      {
        path: 'campaigns',
        loadChildren: () => import('@/features/campaigns/routes'),
        data: {
          icon: '/assets/icons/menu_campaigns.svg',
          name: 'Campaigns',
          permissions: [Permissions.LIST_CAMPAIGN, Permissions.CREATE_CAMPAIGN],
        },
      },
      {
        path: 'email',
        loadChildren: () => import('@/features/send-email-to-banks/routes'),
        canActivate: [PermissionGuard],
        data: {
          icon: '/assets/icons/menu_email.svg',
          name: 'Email',
          permissions: [Permissions.SEND_EMAIL_BANK],
        },
      },
      {
        path: '**',
        redirectTo: 'applications',
        pathMatch: 'full',
      },
    ],
  },
];
