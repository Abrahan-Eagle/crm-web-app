import { Bank } from '../bank';
import { Offer } from './offer.interface';

export enum BankNotificationStatus {
  OFFERED = 'OFFERED',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
  ACCEPTED = 'ACCEPTED',
  SENT = 'SENT',
}
export interface BankNotification {
  id: string;
  bank: Partial<Bank>;
  status: BankNotificationStatus;
  offers: Offer[];
  reject_reason: string;
  created_at: string;
  updated_at?: string;
  reject_reason_description: string | null;
}
