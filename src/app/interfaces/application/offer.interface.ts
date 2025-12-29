export interface Offer {
  id: string;
  purchased_amount: number;
  factor_rate: number;
  points: number;
  purchased_price: number;
  commission: number;
  position?: number;
  payment_plan_duration: number;
  payment_plan: string;
  status: string;
  created_at: string;
  updated_at?: string;
}
