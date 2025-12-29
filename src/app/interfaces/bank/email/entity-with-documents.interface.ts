import { EntityDocument } from './entity-document.interface';

export interface EntityWithDocuments {
  id: string;
  name: string;
  type: 'company' | 'contact';
  documents: EntityDocument[];
}
