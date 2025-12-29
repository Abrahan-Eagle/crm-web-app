import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { DraftDetails, DraftListItem, PaginatedResponse, UpdateDraft } from '@/interfaces';
import { SearchModel } from '@/models';
import { HttpService } from '@/utils';

@Injectable({
  providedIn: 'root',
})
export class DraftsService {
  constructor(private readonly _http: HttpService) {}

  getDraft(id: string): Observable<DraftDetails> {
    return this._http.get<DraftDetails>(`${environment.BASE_API}/v1/drafts/${id}`, true);
  }

  searchDrafts(search: SearchModel): Observable<PaginatedResponse<DraftListItem>> {
    return this._http.get<PaginatedResponse<DraftListItem>>(`${environment.BASE_API}/v1/drafts?${search.toQuery()}`);
  }

  updateDrat(draftId: string, update: UpdateDraft[]): Observable<void> {
    return this._http.put<void>(`${environment.BASE_API}/v1/drafts/${draftId}`, { body: update });
  }

  deleteDraft(draftId: string): Observable<void> {
    return this._http.delete<void>(`${environment.BASE_API}/v1/drafts/${draftId}`);
  }

  publishDraft(draftId: string): Observable<void> {
    return this._http.put<void>(`${environment.BASE_API}/v1/drafts/${draftId}/publish`);
  }

  transferDraft(draftId: string, userId: string): Observable<void> {
    return this._http.put(`${environment.BASE_API}/v1/drafts/${draftId}/transfer-to/${userId}`).pipe(map(() => void 0));
  }
}
