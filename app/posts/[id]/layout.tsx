import type { Metadata } from 'next';
import { stripHtml } from '@/lib/wp';

const API = 'https://huss.harmonynet.kr/wp-json/wp/v2/posts';
const SITE = 'https://harmonynet--harmonynet.asia-east1.hosted.app';
const FALLBACK = `${SITE}/harmonynet-logo.png`;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const query = /^\d+$/.test(id) ? `include=${id}` : `slug=${encodeURIComponent(id)}`;
  try {
    const res = await fetch(`${API}?_embed=1&${query}&per_page=1`, { headers: { Accept: 'application/json', 'User-Agent': 'HarmonynetBot/1.0' }, next: { revalidate: 60 } });
    const data = await res.json();
    const post = Array.isArray(data) ? data[0] : data;
    if (!post) throw new Error('not found');
    const title = stripHtml(post.title?.rendered || '하모니넷 기사');
    const description = stripHtml(post.excerpt?.rendered || '').slice(0, 160) || '하모니넷 지역·대학 뉴스';
    const media = post._embedded?.['wp:featuredmedia']?.[0];
    const image = media?.source_url || FALLBACK;
    const url = `${SITE}/posts/${encodeURIComponent(id)}`;
    return { title, description, openGraph: { type: 'article', url, title, description, siteName: '하모니넷', images: [{ url: image, alt: media?.alt_text || title }] }, twitter: { card: 'summary_large_image', title, description, images: [image] } };
  } catch {
    const title = '하모니넷 기사';
    const description = '하모니넷 지역·대학 뉴스';
    const url = `${SITE}/posts/${encodeURIComponent(id)}`;
    return { title, description, openGraph: { type: 'article', url, title, description, images: [{ url: FALLBACK }] }, twitter: { card: 'summary_large_image', title, description, images: [FALLBACK] } };
  }
}

export default function PostIdLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
