import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { CompanyDetails, CompanyListItem, CreateOrUpdateCompanyForm, Note, PaginatedResponse } from '@/interfaces';
import { SearchModel } from '@/models';
import { HttpService } from '@/utils';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  constructor(private readonly _http: HttpService) {}

  searchCompanies(search: SearchModel): Observable<PaginatedResponse<CompanyListItem>> {
    return this._http.get<PaginatedResponse<CompanyListItem>>(
      `${environment.BASE_API}/v1/companies?${search.toQuery()}`,
    );
  }

  createCompany(company: CreateOrUpdateCompanyForm, typedFiles: { type: string; file: File }[]): Observable<void> {
    const form = new FormData();
    
    // Add files with document type as FormData key
    if (typedFiles.length > 0) {
      typedFiles.forEach(({ type, file }) => {
        form.append(type, file);
      });
    }

    form.append('body', JSON.stringify(company));

    return this._http.post(`${environment.BASE_API}/v1/companies`, { body: form }).pipe(map(() => void 0));
  }

  getCompany(id: string, errorHandled?: boolean): Observable<CompanyDetails> {
    return this._http.get(`${environment.BASE_API}/v1/companies/${id}`, errorHandled);
  }

  removeFile(companyId: string, fileId: string): Observable<void> {
    return this._http
      .delete(`${environment.BASE_API}/v1/companies/${companyId}/documents/${fileId}`)
      .pipe(map(() => void 0));
  }

  addFile(companyId: string, type: string, file: File): Observable<void> {
    const form = new FormData();
    form.set('document', file);

    return this._http
      .put(`${environment.BASE_API}/v1/companies/${companyId}/documents/${type}`, { body: form })
      .pipe(map(() => void 0));
  }

  updateCompany(id: string, company: Partial<CreateOrUpdateCompanyForm>): Observable<void> {
    return this._http.put(`${environment.BASE_API}/v1/companies/${id}`, { body: company }).pipe(map(() => void 0));
  }

  createNote(companyId: string, notes: Partial<Note>): Observable<void> {
    return this._http
      .post(`${environment.BASE_API}/v1/companies/${companyId}/notes`, { body: notes })
      .pipe(map(() => void 0));
  }

  removeNote(companyId: string, noteId: string): Observable<void> {
    return this._http
      .delete(`${environment.BASE_API}/v1/companies/${companyId}/notes/${noteId}`)
      .pipe(map(() => void 0));
  }

  transferCompany(companyId: string, userId: string): Observable<void> {
    return this._http
      .put(`${environment.BASE_API}/v1/companies/${companyId}/transfer-to/${userId}`)
      .pipe(map(() => void 0));
  }
}
