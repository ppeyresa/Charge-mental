
export type Category = string;

export interface AdminItem {
  id: string;
  title: string;
  provider: string;
  category: Category;
  dueDate: string;
  amount?: number;
  status: 'pending' | 'completed' | 'urgent';
  renewalDate?: string;
  notes?: string;
}

export interface Insight {
  id: string;
  type: 'optimization' | 'warning' | 'reminder' | 'deal';
  title: string;
  description: string;
  actionLabel: string;
  url?: string;
  savings?: string;
}

export interface MentalLoadState {
  score: number; // 0 to 100
  pendingCount: number;
  urgentCount: number;
  savingsPotential: number;
  totalExpenses: number;
}
