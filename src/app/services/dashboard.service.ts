import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { HttpService } from '@/utils';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private readonly _http: HttpService) {}

  getDashboard(): Observable<string> {
    return this._http.get<string>(`${environment.BASE_API}/v1/dashboard`);
  }
}
