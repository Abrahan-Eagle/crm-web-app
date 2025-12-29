import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { CreateUser, PaginatedResponse, Role, User } from '@/interfaces';
import { SearchModel } from '@/models';
import { HttpService } from '@/utils';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private readonly _http: HttpService) {}

  updateProfile(update: Partial<User>): Observable<void> {
    return this._http.put(`${environment.BASE_API}/v1/users`, { body: update }).pipe(map(() => void 0));
  }

  searchUser(search: SearchModel): Observable<PaginatedResponse<User>> {
    return this._http.get<PaginatedResponse<User>>(`${environment.BASE_API}/v1/users?${search.toQuery()}`);
  }

  createUser(user: CreateUser): Observable<void> {
    return this._http.post(`${environment.BASE_API}/v1/users`, { body: user }).pipe(map(() => void 0));
  }

  updateUser(userId: string, update: Partial<User>): Observable<void> {
    return this._http.put(`${environment.BASE_API}/v1/users/${userId}`, { body: update }).pipe(map(() => void 0));
  }

  getRoles(): Observable<Role[]> {
    return this._http.get<Role[]>(`${environment.BASE_API}/v1/users/roles`);
  }

  addRole(userId: string, roleId: string): Observable<void> {
    return this._http
      .put<void>(`${environment.BASE_API}/v1/users/roles/add`, {
        body: {
          user_id: userId,
          role: roleId,
        },
      })
      .pipe(map(() => void 0));
  }

  removeRole(userId: string, roleId: string): Observable<void> {
    return this._http
      .put<void>(`${environment.BASE_API}/v1/users/roles/remove`, {
        body: {
          user_id: userId,
          role: roleId,
        },
      })
      .pipe(map(() => void 0));
  }

  disableUser(userId: string): Observable<void> {
    return this._http.delete<void>(`${environment.BASE_API}/v1/users/disable/${userId}`).pipe(map(() => void 0));
  }

  enableUser(userId: string): Observable<void> {
    return this._http.put<void>(`${environment.BASE_API}/v1/users/enable/${userId}`).pipe(map(() => void 0));
  }
}
