import type { Metadata } from 'next';
import { stripHtml } from '@/lib/wp';

const WP_POSTS_URL = 'https://huss.harmonynet.kr/wp-json/wp/v2/posts';
const SITE_URL = 'https://harmonynet--harmonynet.asia-east1.hosted.app';

type PostMeta = {
  id: number;
  slug: string;
  title?: { rendered?: string };
  excerpt?: { rendered?: string };
  _embedded?: { 'wp:featuredmedia'?: { source_url?: string; alt_text?: string }[] };
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const isNumeric = /^\d+$/.test(id);
  const query = isNumeric ? `include=${encodeURIComponent(id)}` : `slug=${encodeURIComponent(decodeURIComponent(id))}`;

  try {
    const response = await fetch(`${WP_POSTS_URL}?_embed=1&${query}&per_page=1`, { next: { revalidate: 60 } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const post: PostMeta | undefined = Array.isArray(data) ? data[0] : data;
    if (!post) return {};

    const title = stripHtml(post.title?.rendered || '하모니넷 기사');
    const description = stripHtml(post.excerpt?.rendered || '').slice(0, 160) || '하모니넷 지역·대학 뉴스';
    const image = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
    const url = `${SITE_URL}/posts/${encodeURIComponent(id)}`;

    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: {
        type: 'article',
        url,
        title,
        description,
        siteName: '하모니넷',
        locale: 'ko_KR',
        ...(image ? { images: [{ url: image, alt: post._embedded?.['wp:featuredmedia']?.[0]?.alt_text || title }] } : {}),
      },
      twitter: {
        card: image ? 'summary_large_image' : 'summary',
        title,
        description,
        ...(image ? { images: [image] } : {}),
      },
    };
  } catch {
    return {};
  }
}

export default function PostsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
