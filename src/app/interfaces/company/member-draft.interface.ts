import { Contact, ContactSummary } from '@/interfaces';

export interface MemberDraft {
  title: string;
  percentage: number;
  member_since: Date;
  contact?: Partial<ContactSummary | Contact>;
  contact_id?: string;
}
