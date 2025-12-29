import { Phone } from '../common';

export interface BankContact {
  first_name: string;
  last_name: string;
  phones: Phone[];
  emails: string[];
}
