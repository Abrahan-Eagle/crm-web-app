import { computed, Injectable, signal } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { map, Observable, of, tap } from 'rxjs';

import { Permissions } from '../permissions';

@Injectable({ providedIn: 'root' })
export class UserPermissionsService {
  public readonly permissions = computed(() => this._permissions());

  private readonly _permissions = signal<string[]>([]);

  private loaded = false;

  constructor(private readonly auth: AuthService) {}

  public loadPermissions(): Observable<void> {
    if (this.loaded) {
      return of({}).pipe(map(() => void 0));
    }

    this.loaded = true;
    return this.auth.getAccessTokenSilently().pipe(
      tap((token) => {
        const decodedToken: Record<string, any> = this._parseJwt(token);
        const permissions: string[] = Array.isArray(decodedToken?.['permissions']) ? decodedToken['permissions'] : [];
        this._permissions.set(permissions);
      }),
      map(() => void 0),
    );
  }

  private _parseJwt(token: string): object {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(''),
    );

    return JSON.parse(jsonPayload);
  }

  hasPermission(permission: Permissions): boolean {
    return this._permissions().includes(permission);
  }
}
