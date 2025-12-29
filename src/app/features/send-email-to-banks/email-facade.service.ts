import { Injectable } from '@angular/core';
import { iif, map, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { CompanyListItem, ContactSummary, EntityDocument, EntityWithDocuments } from '@/interfaces';
import { SearchModel } from '@/models';
import { CompanyService, ContactService } from '@/services';
import { fileNameFromURL, fileTypeFromURL } from '@/utils/function';

@Injectable({
  providedIn: 'root',
})
export class EmailFacadeService {
  constructor(
    private readonly companyService: CompanyService,
    private readonly contactService: ContactService,
  ) {}

  public searchEntities(entityType: 'company' | 'contact', search: SearchModel): Observable<EntityWithDocuments[]> {
    return of(entityType).pipe(
      mergeMap(() =>
        iif(
          () => entityType === 'company',
          this.companyService.searchCompanies(search),
          this.contactService.searchContacts(search),
        ),
      ),
      map((response) => {
        return response.data.map((item) => ({
          id: item.id,
          name:
            entityType === 'company'
              ? (item as CompanyListItem).name
              : `${(item as ContactSummary).first_name} ${(item as ContactSummary).last_name}`,
          type: entityType,
          documents: [],
        }));
      }),
    );
  }

  public getEntityDocuments(entityType: 'company' | 'contact', entityId: string): Observable<EntityDocument[]> {
    return iif(
      () => entityType === 'company',
      this.companyService.getCompany(entityId),
      this.contactService.getContact(entityId),
    ).pipe(
      map((entity) =>
        (entity.documents || []).map((doc) => ({
          id: doc.id,
          name: fileNameFromURL(doc.url),
          file_type: fileTypeFromURL(doc.url),
          created_at: new Date().toISOString(),
          url: doc.url,
        })),
      ),
    );
  }
}
