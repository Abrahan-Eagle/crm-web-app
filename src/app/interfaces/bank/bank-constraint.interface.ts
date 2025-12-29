import { Industry } from './bank-industry.interface';
import { BankTerritory } from './bank-territory.interface';

export interface BankConstraint {
  classifications: string[];
  territories: BankTerritory[];
  deposits?: {
    minimum_amount: number;
    minimum_transactions: number;
    by_industries: {
      minimum_amount: number;
      minimum_transactions: number;
      industry: Industry;
    }[];
  } | null;
  loan_limit?: number | null;
  has_loan_limit: boolean;
  minimum_loan: number;
  minimum_months_in_business: number;
  minimum_daily_balance: number;
  maximum_negative_days: number;
  allowed_industries: Industry[];
  supported_ids: string[];
  positions: number[];
  blocked_products: string[];
}
