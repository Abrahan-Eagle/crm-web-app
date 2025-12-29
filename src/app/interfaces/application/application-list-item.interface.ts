import { User } from '../user';

export interface ApplicationListItem {
  id: string;
  loan_amount: number;
  status: string;
  product: string;
  period: string;
  position: number | null;
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
