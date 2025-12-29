import { Phone } from '../common';

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  referral_id: string;
  status: string;
  roles: string[];
  phone?: Phone | undefined | null;
  tenants: string[];
  created_at: string;
}
