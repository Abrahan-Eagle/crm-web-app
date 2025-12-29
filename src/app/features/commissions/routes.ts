import { Route } from '@angular/router';

import { CommissionsComponent } from './commissions.component';

export default [
  {
    path: '',
    component: CommissionsComponent,
  },
  {
    path: ':id/edit',
    loadComponent: () => import('@/features/edit-commission').then((m) => m.EditCommissionComponent),
  },
  {
    path: ':id/details',
    loadComponent: () => import('@/features/commission-details').then((m) => m.CommissionDetailsComponent),
  },

  { path: '**', redirectTo: '', pathMatch: 'full' },
] satisfies Route[];
