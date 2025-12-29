import { CompanyDetails } from '../company';
import { ApplicationDocument } from './file-documents.interface';

export enum APPLICATION_STATUS {
  READY_TO_SEND = 'READY_TO_SEND',
  SENT = 'SENT',
  REJECTED = 'REJECTED',
  OFFERED = 'OFFERED',
  OFFER_ACCEPTED = 'OFFER_ACCEPTED',
  APPROVED_NOT_FUNDED = 'APPROVED_NOT_FUNDED',
  COMPLETED = 'COMPLETED',
}
export interface ApplicationDetails {
  id: string;
  product: string;
  loan_amount: number;
  status: APPLICATION_STATUS;
  position: number | null;
  company: CompanyDetails & { documents: ApplicationDocument[] };
  additional_statements: ApplicationDocument[];
  bank_statements: ApplicationDocument[];
  credit_card_statements: ApplicationDocument[];
  filled_applications: ApplicationDocument[];
  mtd_statements: ApplicationDocument[];
  reject_reason: string;
  reject_reason_description?: string | null;
  substatus?: string | null;
}
