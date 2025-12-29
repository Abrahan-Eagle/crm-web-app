import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { Campaign, CreateCampaign } from '@/interfaces';
import { HttpService } from '@/utils';

@Injectable({
  providedIn: 'root',
})
export class CampaignService {
  constructor(private readonly _http: HttpService) {}

  getCampaigns(): Observable<Campaign[]> {
    return this._http.get<Campaign[]>(`${environment.BASE_API}/v1/campaigns`);
  }

  stopCampaign(campaignId: string): Observable<void> {
    return this._http.put<void>(`${environment.BASE_API}/v1/campaigns/${campaignId}/stop`).pipe(map(() => void 0));
  }

  startCampaign(campaignId: string): Observable<void> {
    return this._http.put<void>(`${environment.BASE_API}/v1/campaigns/${campaignId}/start`).pipe(map(() => void 0));
  }

  createCampaign(campaign: CreateCampaign, file: File): Observable<void> {
    const form = new FormData();
    form.append('file', file);
    form.append('body', JSON.stringify(campaign));

    return this._http.post(`${environment.BASE_API}/v1/campaigns`, { body: form });
  }
}
