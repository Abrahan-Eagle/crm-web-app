import { Route } from '@angular/router';

import { CampaignsComponent } from './campaigns.component';

export default [
  {
    path: '',
    component: CampaignsComponent,
  },
  {
    path: 'create',
    loadComponent: () => import('@/features/create-campaign').then((x) => x.CreateCampaignComponent),
  },
  { path: '**', redirectTo: '', pathMatch: 'full' },
] satisfies Route[];
