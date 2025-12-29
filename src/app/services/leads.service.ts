import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { CreateLead, LeadGroup, Note, PaginatedResponse, Prospect } from '@/interfaces';
import { SearchModel } from '@/models';
import { HttpService } from '@/utils';

@Injectable({
  providedIn: 'root',
})
export class LeadsService {
  constructor(private readonly _http: HttpService) {}

  searchLeads(search: SearchModel): Observable<PaginatedResponse<LeadGroup>> {
    return this._http.get<PaginatedResponse<LeadGroup>>(`${environment.BASE_API}/v1/leads?${search.toQuery()}`);
  }

  searchProspects(search: SearchModel, leadGroupId: string): Observable<PaginatedResponse<Prospect>> {
    return this._http.get<PaginatedResponse<Prospect>>(
      `${environment.BASE_API}/v1/leads/${leadGroupId}?${search.toQuery()}`,
    );
  }

  createLead(leadGroup: CreateLead, file: File): Observable<{ skipped: number[] }> {
    const form = new FormData();
    form.append('file', file);
    form.append('body', JSON.stringify(leadGroup));

    return this._http.post(`${environment.BASE_API}/v1/leads`, { body: form });
  }

  getProspect(leadId: string, prospectId: string): Observable<Prospect> {
    return this._http.get(`${environment.BASE_API}/v1/leads/${leadId}/prospects/${prospectId}`);
  }

  addProspectNote(leadId: string, prospectId: string, note: Note): Observable<void> {
    return this._http
      .post(`${environment.BASE_API}/v1/leads/${leadId}/prospects/${prospectId}/notes`, { body: note })
      .pipe(map(() => void 0));
  }

  transferLead(leadId: string, userId: string): Observable<void> {
    return this._http.put(`${environment.BASE_API}/v1/leads/${leadId}/transfer/${userId}`).pipe(map(() => void 0));
  }
}
