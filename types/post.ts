export interface WPPostRendered {
  rendered: string;
  protected?: boolean;
}

export interface WPMediaSize {
  file: string;
  width: number;
  height: number;
  mime_type: string;
  source_url: string;
}

export interface WPMedia {
  id: number;
  date: string;
  slug: string;
  type: string;
  link: string;
  title: WPPostRendered;
  author: number;
  alt_text: string;
  media_type: 'image' | 'file';
  mime_type: string;
  media_details: {
    width: number;
    height: number;
    file: string;
    sizes: {
      thumbnail?: WPMediaSize;
      medium?: WPMediaSize;
      medium_large?: WPMediaSize;
      large?: WPMediaSize;
      full?: WPMediaSize;
      [key: string]: WPMediaSize | undefined;
    };
  };
  source_url: string;
}

export interface WPAuthor {
  id: number;
  name: string;
  url: string;
  description: string;
  link: string;
  slug: string;
  avatar_urls?: Record<string, string>;
}

export interface WPTerm {
  id: number;
  link: string;
  name: string;
  slug: string;
  taxonomy: 'category' | 'post_tag' | string;
}

export interface WPPostEmbedded {
  'wp:featuredmedia'?: WPMedia[];
  'author'?: WPAuthor[];
  'wp:term'?: WPTerm[][];
}

export interface WPPost {
  id: number;
  date: string;
  date_gmt: string;
  guid: WPPostRendered;
  modified: string;
  modified_gmt: string;
  slug: string;
  status: 'publish' | 'future' | 'draft' | 'pending' | 'private';
  type: string;
  link: string;
  title: WPPostRendered;
  content: WPPostRendered;
  excerpt: WPPostRendered;
  author: number;
  featured_media: number;
  categories: number[];
  tags: number[];
  _embedded?: WPPostEmbedded;
}

export interface WPCategory {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: 'category';
  parent: number;
}

export interface NormalizedPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  formattedDate: string;
  imageUrl: string;
  imageAlt: string;
  authorName: string;
  categoryName: string;
  categoryId: number | null;
  categorySlug: string;
}
