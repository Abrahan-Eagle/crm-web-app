import { Industry } from './bank-industry.interface';

export interface DepositConstraintByIndustry {
  minimum_amount: number;
  minimum_transactions: number;
  industry: Industry[];
}
