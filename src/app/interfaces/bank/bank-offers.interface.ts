import { Offer } from '../application';
import { CompanyDetails } from '../company';

export interface BankOffer {
  id: string;
  company: Partial<CompanyDetails>;
  offer: Partial<Offer>;
}
