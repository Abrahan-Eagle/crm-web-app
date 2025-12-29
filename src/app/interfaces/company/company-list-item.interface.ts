import { Phone } from '../common';
import { User } from '../user/user.interface';

export interface CompanyListItem {
  id: string;
  name: string;
  dba: string | null;
  country_iso_code_2: string;
  phone_numbers: Phone[];
  tax_id: string;
  creation_date: Date;
  created_by: Partial<User | null>;
}
