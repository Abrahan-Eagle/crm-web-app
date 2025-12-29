import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { CompanyDetails, Contact, ContactSummary, CreateContactForm, PaginatedResponse } from '@/interfaces';
import { SearchModel } from '@/models';
import { HttpService } from '@/utils';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  constructor(private readonly _http: HttpService) {}

  searchContacts(search: SearchModel): Observable<PaginatedResponse<ContactSummary>> {
    return this._http.get<PaginatedResponse<ContactSummary>>(`${environment.BASE_API}/v1/contacts?${search.toQuery()}`);
  }

  createContact(contact: CreateContactForm, files: (File & { docType: string })[]): Observable<void> {
    const form = new FormData();
    if (files.length > 0) {
      files.forEach((file) => form.append(file.docType, file));
    }

    form.append('body', JSON.stringify(contact));

    return this._http.post(`${environment.BASE_API}/v1/contacts`, { body: form }).pipe(map(() => void 0));
  }

  getContact(id: string, errorHandled?: boolean): Observable<Contact> {
    return this._http.get(`${environment.BASE_API}/v1/contacts/${id}`, errorHandled);
  }

  updateContact(id: string, contact: Partial<CreateContactForm>): Observable<void> {
    return this._http.put(`${environment.BASE_API}/v1/contacts/${id}`, { body: contact }).pipe(map(() => void 0));
  }

  addFile(contactId: string, type: string, file: File): Observable<void> {
    const form = new FormData();
    form.set('document', file);

    return this._http
      .put(`${environment.BASE_API}/v1/contacts/${contactId}/documents/${type}`, { body: form })
      .pipe(map(() => void 0));
  }

  removeFile(contactId: string, fileId: string): Observable<void> {
    return this._http
      .delete(`${environment.BASE_API}/v1/contacts/${contactId}/documents/${fileId}`)
      .pipe(map(() => void 0));
  }

  createNote(contactId: string, notes: Partial<any>): Observable<void> {
    return this._http
      .post(`${environment.BASE_API}/v1/contacts/${contactId}/notes`, { body: notes })
      .pipe(map(() => void 0));
  }

  removeNote(contactId: string, noteId: string): Observable<void> {
    return this._http
      .delete(`${environment.BASE_API}/v1/contacts/${contactId}/notes/${noteId}`)
      .pipe(map(() => void 0));
  }

  getContactCompanies(contactId: string, search: SearchModel): Observable<PaginatedResponse<CompanyDetails>> {
    return this._http.get<PaginatedResponse<CompanyDetails>>(
      `${environment.BASE_API}/v1/companies/contact/${contactId}?${search.toQuery()}`,
    );
  }
}
