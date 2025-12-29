import { Phone } from '../common/phone.interface';

export interface UpdateContact {
  first_name: string;
  last_name: string;
  birthdate: string;
  phones?: Phone[];
  emails?: string[];
}
