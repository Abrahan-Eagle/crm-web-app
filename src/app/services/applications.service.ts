import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import {
  Application,
  ApplicationDetails,
  ApplicationListItem,
  Bank,
  BankNotification,
  Offer,
  PaginatedResponse,
} from '@/interfaces';
import { SearchModel } from '@/models';
import { HttpService } from '@/utils';

@Injectable({
  providedIn: 'root',
})
export class ApplicationsService {
  constructor(private readonly _http: HttpService) {}

  completeApplication(id: string): Observable<void> {
    return this._http.put<void>(`${environment.BASE_API}/v1/applications/${id}/complete`);
  }

  createOffer(applicationId: string, notificationId: string, request: Partial<Offer>): Observable<void> {
    return this._http.post<void>(
      `${environment.BASE_API}/v1/applications/${applicationId}/notifications/${notificationId}`,
      {
        body: request,
      },
    );
  }

  restoreNotification(applicationId: string, notificationId: string): Observable<void> {
    return this._http.put<void>(
      `${environment.BASE_API}/v1/applications/${applicationId}/notifications/${notificationId}/restore`,
    );
  }

  rejectApplication(applicationId: string, request: { reason: string; other?: string | null }): Observable<void> {
    return this._http.patch<void>(`${environment.BASE_API}/v1/applications/${applicationId}/reject`, {
      body: request,
    });
  }

  rejectNotifications(
    appId: string,
    notificationId: string,
    request: { reason: string; other?: string | null },
  ): Observable<void> {
    return this._http.patch<void>(`${environment.BASE_API}/v1/applications/${appId}/notifications/${notificationId}`, {
      body: request,
    });
  }

  getNotifications(id: string): Observable<BankNotification[]> {
    return this._http.get<BankNotification[]>(`${environment.BASE_API}/v1/applications/${id}/notifications`);
  }

  sendAppToBanks(appId: string, request: { message: string; bank_ids: string[] }): Observable<void> {
    return this._http.put(`${environment.BASE_API}/v1/applications/${appId}/notifications`, { body: request });
  }

  getApplication(id: string, errorHandled: boolean): Observable<ApplicationDetails> {
    return this._http.get<ApplicationDetails>(`${environment.BASE_API}/v1/applications/${id}`, errorHandled);
  }

  getRecommendedBanks(id: string): Observable<Partial<Bank>[]> {
    return this._http.get<Partial<Bank>[]>(`${environment.BASE_API}/v1/applications/${id}/recommended-banks`);
  }

  searchApplication(search: SearchModel): Observable<PaginatedResponse<ApplicationListItem>> {
    return this._http.get<PaginatedResponse<ApplicationListItem>>(
      `${environment.BASE_API}/v1/applications?${search.toQuery()}`,
    );
  }

  lastValidPeriod(companyId: string): Observable<string | null> {
    return this._http.get<string | null>(`${environment.BASE_API}/v1/last-application-period/${companyId}`);
  }

  createApplication(application: Application, files: File[]): Observable<void> {
    const form = new FormData();
    if (files.length > 0) {
      files.forEach((file) => form.append('documents', file));
    }

    form.append('body', JSON.stringify(application));

    return this._http.post(`${environment.BASE_API}/v1/applications`, { body: form }).pipe(map(() => void 0));
  }

  acceptOffer(applicationId: string, notificationId: string, offerId: string): Observable<void> {
    return this._http.put<void>(
      `${environment.BASE_API}/v1/applications/${applicationId}/notifications/${notificationId}/accept/${offerId}`,
    );
  }

  cancelOffer(applicationId: string, notificationId: string, offerId: string): Observable<void> {
    return this._http.put<void>(
      `${environment.BASE_API}/v1/applications/${applicationId}/notifications/${notificationId}/cancel/${offerId}`,
    );
  }

  updateOffer(
    applicationId: string,
    notificationId: string,
    offerId: string,
    request: Partial<Offer>,
  ): Observable<Offer> {
    return this._http.put<Offer>(
      `${environment.BASE_API}/v1/applications/${applicationId}/notifications/${notificationId}/update/${offerId}`,
      { body: request },
    );
  }

  updateSubStatus(applicationId: string, request: Partial<any>): Observable<void> {
    return this._http.put<void>(`${environment.BASE_API}/v1/applications/${applicationId}/substatus`, {
      body: request,
    });
  }

  removeApplication(applicationId: string): Observable<void> {
    return this._http.delete<void>(`${environment.BASE_API}/v1/applications/${applicationId}`);
  }

  transferApp(appId: string, userId: string): Observable<void> {
    return this._http
      .put(`${environment.BASE_API}/v1/applications/${appId}/transfer-to/${userId}`)
      .pipe(map(() => void 0));
  }

  updatePosition(applicationId: string, position: number): Observable<void> {
    return this._http.patch<void>(`${environment.BASE_API}/v1/applications/${applicationId}/position/${position}`);
  }
}
