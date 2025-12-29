import { User } from '../user';

export interface LeadGroup {
  id: string;
  name: string;
  prospects: number;
  created_at: Date;
  created_by: Partial<User>;
  assigned_to: Partial<User>;
}
