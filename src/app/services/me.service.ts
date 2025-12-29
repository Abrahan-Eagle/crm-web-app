import { Injectable, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';

import { User } from '@/interfaces';
import { HttpService } from '@/utils';

@Injectable({
  providedIn: 'root',
})
export class MeService {
  private readonly _refreshTrigger = signal(0);

  public readonly user = toSignal(toObservable(this._refreshTrigger).pipe(switchMap(() => this._getMyProfile())), {
    initialValue: null,
  });

  constructor(private readonly _http: HttpService) {}

  private _getMyProfile() {
    return this._http.get<User>(`${environment.BASE_API}/v1/users/me`);
  }

  public refreshProfile() {
    this._refreshTrigger.update((v) => v + 1);
  }
}
