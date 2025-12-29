import { BankListItem } from '../bank';
import { OfferDetails } from '../commission/offer-details.interface';
import { CompanyListItem } from '../company';
import { User } from '../user';

export interface Commission {
  application: OfferDetails;
  company: CompanyListItem;
  bank: BankListItem;
  commission: CommissionDetails;
  psf: CommissionDetails;
}

interface CommissionDetails {
  distribution: Distribution[];
  total: number;
}

export interface Distribution {
  amount: number;
  user: Partial<User>;
}
