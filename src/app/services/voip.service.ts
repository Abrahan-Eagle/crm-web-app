import { EventEmitter, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { MakeACall, Phone } from '@/interfaces';
import { HttpService } from '@/utils';

@Injectable({
  providedIn: 'root',
})
export class VoIPService {
  public readonly callRequested = new EventEmitter<MakeACall>();

  constructor(private readonly _http: HttpService) {}

  makeACall(call: MakeACall): Observable<void> {
    return this._http.post<void>(`${environment.BASE_API}/v1/users/make-a-call`, { body: call });
  }

  makeACustomCall(phone: Phone): Observable<void> {
    return this._http.post<void>(`${environment.BASE_API}/v1/users/make-custom-a-call`, { body: phone });
  }

  requestACall(call: MakeACall): void {
    this.callRequested.emit(call);
  }
}
