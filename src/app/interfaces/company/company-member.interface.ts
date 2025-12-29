import { Contact, ContactSummary } from '@/interfaces';

export interface CompanyMember {
  title: string;
  percentage: number;
  member_since: Date;
  contact: Partial<ContactSummary | Contact>;
}
