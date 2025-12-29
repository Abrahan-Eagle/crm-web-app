export interface SelectedAttachment {
  entity_type: 'company' | 'contact';
  entity_id: string;
  document_id: string;
  document_name: string;
  file_type: string;
  source: string;
}
