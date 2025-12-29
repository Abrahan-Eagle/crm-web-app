import { Phone } from '../common';
import { Note } from '../contacts';
import { CallLog } from './call-log.interface';

export interface Prospect {
  id: string;
  company: string;
  name: string;
  email: string;
  phone: Phone;
  last_call: null | Date;
  note_count: number;
  follow_up_call: string | null;
  notes: Note[];
  call_history: CallLog[];
}
