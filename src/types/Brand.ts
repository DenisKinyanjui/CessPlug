export interface Brand {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  website?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BrandsResponse {
  success: boolean;
  data: {
    brands: Brand[];
  };
}

export interface CreateBrandData {
  name: string;
  description?: string;
  logo?: string;
  website?: string;
}