import { User } from '../user';

export interface DraftListItem {
  id: string;
  loan_amount: number;
  product: string;
  period: string;
  company: ApplicationListCompany;
  created_at: Date;
  created_by?: Partial<User>;
}

interface ApplicationListCompany {
  country_iso_code_2: string;
  dba: string;
  name: string;
  id: string;
}
