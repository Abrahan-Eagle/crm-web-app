import { Phone } from '../common';
import { Address } from '../demographics';
import { BANK_TYPE } from './bank.interface';

export interface CreateBankForm {
  id: string;
  name: string;
  bank_type: BANK_TYPE;
  manager: string;
  address: Address;
  contacts: {
    first_name: string;
    last_name: string;
    phones: Phone[];
    emails: string[];
  }[];
  constraints: {
    classifications: string[];
    territories: string[];
    deposits: {
      minimum_amount: number;
      minimum_transactions: number;
      by_industries: {
        minimum_amount: number;
        minimum_transactions: number;
        industry: string;
      }[];
    } | null;
    loan_limit: number;
    minimum_months_in_business: number;
    minimum_daily_balance: number;
    maximum_negative_days: number;
    allowed_industries: string[];
    supported_ids: string[];
    positions: number[];
    blocked_products: string[];
  };
}
