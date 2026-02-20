export interface Tag {
  id: string;
  name: string;
  label?: string;
}

export interface BlogPost {
  _id: string;
  id: string;
  title: string;
  slug: string;
  // Simplified Tiptap JSON document stored as jsonb in the database
  body: any;
  excerpt: string;
  // Optional legacy category kept during migration to tags-only
  category?: string;
  status: "draft" | "published";
  headerImage: string | null;
  views: number;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  total?: number;
  totalPages?: number;
  currentPage?: number;
}
