export type CategoryStatus = "active" | "inactive";

export interface Category {
  id: string;
  name: string;
  description: string;
  status: CategoryStatus;
  slug: string;
  created_at: string;
  updated_at: string;
}
