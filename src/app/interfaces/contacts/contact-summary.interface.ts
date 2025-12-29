import { Phone } from '../common';
import { Note } from './contact-note.interface';

export interface ContactSummary {
  id: string;
  first_name: string;
  last_name: string;
  phones: Phone[];
  emails: string[];
  country_iso_code_2: string;
  notes: Note[];
}
