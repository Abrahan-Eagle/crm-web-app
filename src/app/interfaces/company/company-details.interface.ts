import { Industry } from '../bank';
import { Phone } from '../common';
import { Address } from '../demographics';
import { User } from '../user';
import { CompanyMember } from './company-member.interface';

export interface CompanyDetails {
  id: string;
  name: string;
  dba: string | null;
  tax_id: string;
  industry: Industry;
  creation_date: string;
  entity_type: string;
  phone_numbers: Phone[];
  service: string;
  emails: string[];
  address: Address;
  members: CompanyMember[];
  notes: Note[];
  created_by: User;
  documents: { id: string; url: string; type: string }[];
  created_at: string;
}

interface Note {
  id: string;
  level: string;
  description: string;
  created_at: string;
  author: {
    id: string;
    first_name: string;
    last_name: string;
  };
}
