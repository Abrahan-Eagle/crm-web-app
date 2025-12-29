import { CompanyDetails } from '../company';
import { ApplicationDocument } from './file-documents.interface';

export interface DraftDetails {
  id: string;
  product: string;
  loan_amount: number;
  company: CompanyDetails & { documents: ApplicationDocument[] };
  bank_statements: ApplicationDocument[];
  signature_url?: string;
}
