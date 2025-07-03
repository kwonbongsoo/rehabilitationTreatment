export type ContentType = 'banner' | 'faq' | 'policy' | 'terms' | 'about';

export interface Content {
  id: string;
  type: ContentType;
  title: string;
  content: string;
  slug: string;
  published: boolean;
  publishedAt?: string;
  image?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ContentListItem {
  id: string;
  type: ContentType;
  title: string;
  slug: string;
  published: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContentFilter {
  type?: ContentType;
  published?: boolean;
  startDate?: string;
  endDate?: string;
  sortBy?: 'publishedAt' | 'createdAt' | 'title';
  order?: 'asc' | 'desc';
}
