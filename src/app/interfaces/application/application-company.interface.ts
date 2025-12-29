import { Phone } from '../common';
import { CompanyMember } from '../company';
import { Address } from '../demographics';
import { ApplicationDocument } from './file-documents.interface';

export interface ApplicationCompany {
  phone_numbers: Phone[];
  members: CompanyMember[];
  emails: string[];
  documents: ApplicationDocument[];
  address: Address;
  country_iso_code_2: string;
  name: string;
  dba: string | null;
}

export interface DocumentCompany {
  id: string;
  url: string;
}
