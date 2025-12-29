export interface Campaign {
  id: string;
  sender: string;
  subject: string;
  message: string;
  pending: number;
  contacts: number;
  status: 'COMPLETED' | 'STOPPED' | 'SENDING';
}
