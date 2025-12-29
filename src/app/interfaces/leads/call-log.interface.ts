import { User } from '../user';

export interface CallLog {
  created_by: Partial<User>;
  created_at: Date | string;
}
