import { Phone } from '../common';
import { Address } from '../demographics';
import { User } from '../user';
import { Note } from './contact-note.interface';

export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  birthdate: string;
  ssn: string;
  address: Address;
  phones: Phone[];
  emails: string[];
  documents?: { id: string; url: string; type: string }[];
  notes: Note[];
  identification_type: 'ITIN' | 'SSN';
  created_by: User;
  created_at: string;
}
