import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Commission, CommissionListItem, FormCommission, PaginatedResponse } from '../interfaces';
import { SearchModel } from '../models';
import { HttpService } from '../utils';

@Injectable({
  providedIn: 'root',
})
export class CommissionsService {
  constructor(private readonly _http: HttpService) {}

  searchCommissions(search: SearchModel): Observable<PaginatedResponse<CommissionListItem>> {
    return this._http.get<PaginatedResponse<CommissionListItem>>(
      `${environment.BASE_API}/v1/commissions?${search.toQuery()}`,
    );
  }

  getCommission(id: string, errorHandled?: boolean): Observable<Commission> {
    return this._http.get<Commission>(`${environment.BASE_API}/v1/commissions/${id}`, errorHandled);
  }

  saveCommission(id: string, commission: FormCommission): Observable<any> {
    return this._http.put(`${environment.BASE_API}/v1/commissions/${id}`, { body: commission });
  }

  publishCommission(id: string): Observable<void> {
    return this._http.put(`${environment.BASE_API}/v1/commissions/${id}/publish`);
  }
}
