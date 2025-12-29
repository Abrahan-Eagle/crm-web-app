export interface SendEmailToBanksRequest {
  bank_ids: string[];
  subject: string;
  message: string;
  attachments: {
    entity_type: string;
    entity_id: string;
    document_id: string;
  }[];
}
