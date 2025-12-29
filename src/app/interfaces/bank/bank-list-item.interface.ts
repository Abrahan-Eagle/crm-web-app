import { Industry } from './bank-industry.interface';
import { BankTerritory } from './bank-territory.interface';

export interface BankListItem {
  id: string;
  name: string;
  manager: string;
  bank_type: string;
  classifications: string[];
  country_iso_code_2: string;
  territories: BankTerritory[];
  loan_limit?: number;
  has_loan_limit: boolean;
  minimum_loan: number;
  deposits?: {
    minimum_amount: number;
    minimum_transactions: number;
    by_industries: {
      minimum_amount: number;
      minimum_transactions: number;
      industry: Industry;
    }[];
  } | null;
  minimum_daily_balance: number;
  maximum_negative_days: number;
  status: string;
  blacklist: {
    blacklisted_at: string;
    blacklisted_by: string;
    note: string;
  } | null;
}
