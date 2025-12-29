import { Phone } from '../common';
import { Address } from '../demographics';

export interface CreateContactForm {
  id: string;
  first_name: string;
  last_name: string;
  birthdate: string;
  ssn: string;
  address: Address;
  phones: Phone[];
  emails: string[];
  note?: Note;
}

interface Note {
  id: string;
  description: string;
  level: string;
}
