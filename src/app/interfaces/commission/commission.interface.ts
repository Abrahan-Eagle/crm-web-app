interface DistributionItem {
  amount: number;
  user_id: string;
}

export interface FormCommission {
  psf: {
    total: number;
    distribution: DistributionItem[];
  };
  commission: {
    distribution: DistributionItem[];
  };
}
