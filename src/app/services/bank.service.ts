import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import {
  Bank,
  BankListItem,
  BankOffer,
  CreateBankForm,
  PaginatedResponse,
  SendEmailToBanksRequest,
} from '@/interfaces';
import { SearchModel } from '@/models';
import { HttpService } from '@/utils';

@Injectable({
  providedIn: 'root',
})
export class BankService {
  constructor(private readonly _http: HttpService) {}

  searchBanks(search: SearchModel): Observable<PaginatedResponse<BankListItem>> {
    return this._http.get<PaginatedResponse<BankListItem>>(`${environment.BASE_API}/v1/banks?${search.toQuery()}`);
  }

  createBank(bank: CreateBankForm, files: File[]): Observable<void> {
    const form = new FormData();
    if (files.length > 0) {
      files.forEach((file) => form.append('documents', file));
    }

    form.append('body', JSON.stringify(bank));

    return this._http.post(`${environment.BASE_API}/v1/banks`, { body: form }).pipe(map(() => void 0));
  }

  public sendEmailToBanks(request: SendEmailToBanksRequest): Observable<void> {
    return this._http.post(`${environment.BASE_API}/v1/banks/send-email`, { body: request }).pipe(map(() => void 0));
  }

  getBank(id: string, errorHandled: boolean): Observable<Bank> {
    return this._http.get<Bank>(`${environment.BASE_API}/v1/banks/${id}`, errorHandled);
  }

  updateBank(id: string, bank: Partial<Bank>): Observable<void> {
    return this._http.put(`${environment.BASE_API}/v1/banks/${id}`, { body: bank }).pipe(map(() => void 0));
  }

  addFile(bankId: string, file: File): Observable<void> {
    const form = new FormData();
    form.set('document', file);

    return this._http
      .put(`${environment.BASE_API}/v1/banks/${bankId}/documents`, { body: form })
      .pipe(map(() => void 0));
  }

  removeFile(bankId: string, fileId: string): Observable<void> {
    return this._http.delete(`${environment.BASE_API}/v1/banks/${bankId}/documents/${fileId}`).pipe(map(() => void 0));
  }

  getBankOffers(bankId: string, search: SearchModel): Observable<PaginatedResponse<BankOffer>> {
    return this._http.get<PaginatedResponse<BankOffer>>(
      `${environment.BASE_API}/v1/banks/${bankId}/offers?${search.toQuery()}`,
    );
  }

  blacklistBank(bankId: string, note: string): Observable<Bank> {
    const url = `${environment.BASE_API}/v1/banks/${bankId}/blacklist`;
    return this._http.patch<Bank>(url, { body: { note } });
  }

  removeFromBlacklist(bankId: string): Observable<void> {
    const url = `${environment.BASE_API}/v1/banks/${bankId}/blacklist`;
    return this._http.delete<void>(url).pipe(map(() => void 0));
  }
}
