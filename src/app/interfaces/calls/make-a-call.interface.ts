export interface MakeACall {
  entity_type: 'CONTACT' | 'BANK' | 'COMPANY' | 'PROSPECT';
  entity_id: string;
  phone_index: number;
  phone_hint: string;
}
