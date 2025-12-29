import { BankListItem } from '../bank';
import { CompanyListItem } from '../company';

export interface CommissionListItem {
  id: string;
  bank: BankListItem;
  company: CompanyListItem;
  commission: number;
  created_at: string;
  status: string;
  psf: number;
}
