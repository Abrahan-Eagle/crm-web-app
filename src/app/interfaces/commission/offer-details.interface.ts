import { DraftDocument, Referral } from '../application';
import { CompanyListItem } from '../company';

export interface OfferDetails {
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
  amount_financed: number;
  factor_rate: number;
  points: number;
  term: Terms;
}

export enum Terms {
  SHORT_TERM = 'Short Term',
  MEDIUM_TERM = 'Medium Term',
  LONG_TERM = 'Long Term',
}
