export type DealerStatus = "active" | "inactive";

export interface DealerImage {
  image_id: string;
  image_url: string;
}

export interface Dealer {
  id: string;
  dealer_code: string;
  company_name: string;
  slug: string;
  contact_person?: string;
  phone: string;
  email?: string;
  address?: string;
  gst_number?: string;
  dealer_status: DealerStatus;
  notes?: string;
  image_id?: string;
  created_at: string;
  updated_at: string;
  images: DealerImage[];
}
