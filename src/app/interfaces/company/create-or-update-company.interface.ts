import { Industry } from '../bank';
import { Phone } from '../common';
import { Address } from '../demographics';
import { MemberDraft } from './member-draft.interface';

export interface CreateOrUpdateCompanyForm {
  id: string;
  name: string;
  dba: string | null;
  tax_id: string;
  industry: Industry;
  creation_date: string;
  entity_type: string;
  service: string;
  phone_numbers: Phone[];
  emails: string[];
  address: Address;
  members: MemberDraft[];
  note: Note;
}

interface Note {
  id: string;
  description: string;
  level: string;
}
