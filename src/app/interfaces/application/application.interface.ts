import { CompanyListItem } from '../company';
import { Referral } from './application-referral.interface';
import { DraftDocument } from './draft-document.interface';

export interface Application {
  id: string;
  company_id: CompanyListItem;
  loan_amount: number;
  product: string;
  referral: Referral;
  filled_applications: null;
  bank_statements: DraftDocument[];
  mtd_statements: DraftDocument[];
  credit_card_statements: DraftDocument[];
  additional_statements: DraftDocument[];
}
