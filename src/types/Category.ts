export interface Category {
  _id: any;
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent?: {
    _id: any;
    id: string;
    name: string;
    slug: string;
  };
  parentCategory?: string; // For form data
  status: 'active' | 'inactive';
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoriesResponse {
  success: boolean;
  data: {
    categories: Category[];
  };
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  image?: string;
  parent?: string;
}