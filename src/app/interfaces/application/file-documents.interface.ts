export interface ApplicationDocument {
  name?: string;
  source: string;
  amount: number;
  negative_days: number;
  transactions: number;
  period: string;
  type?: string;
  url: string;
  id?: string;
  docType?: string;
}
