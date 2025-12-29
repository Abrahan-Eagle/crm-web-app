export interface DraftDocument {
  amount: number;
  transactions: number;
  negative_days: number;
  period?: string;
  name: string;
  file: File;
}
