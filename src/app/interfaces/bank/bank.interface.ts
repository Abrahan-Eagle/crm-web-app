import { Address } from '../demographics';
import { BankConstraint } from './bank-constraint.interface';
import { BankContact } from './bank-contact.interface';

export enum BANK_TYPE {
  LENDER = 'lender',
  BROKER = 'broker',
}
export interface Bank {
  id: string;
  name: string;
  bank_type: BANK_TYPE | string;
  manager: string;
  status: string;
  address: Address;
  contacts: BankContact[];
  constraints: BankConstraint;
  documents: { id: string; url: string }[];
  created_at: string;
  blacklist: {
    blacklisted_at: string;
    blacklisted_by: string;
    note: string;
  } | null;
}
