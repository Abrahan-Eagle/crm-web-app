import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';

import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  constructor(
    private readonly _notificationService: NotificationService,
    private readonly router: Router,
  ) {}

  resolveNotFound(error: HttpErrorResponse, redirect: string, message: string): Observable<never> {
    if (error.status === 404) {
      this.router.navigate([redirect]);
      this._notificationService.push({ message, type: 'error' });
    } else {
      const { message } = error?.error ?? {};
      const defaultMessage = 'Something went wrong connecting with the server. Try again later.';
      this._notificationService.push({ type: 'error', message: message || defaultMessage });
    }

    return throwError(() => error);
  }
}
