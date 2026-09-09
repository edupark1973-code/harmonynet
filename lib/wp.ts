import { WPPost, NormalizedPost } from '@/types/post';

export const WP_API_BASE = process.env.NEXT_PUBLIC_WP_API_URL || 'https://huss.harmonynet.kr/wp-json/wp/v2';
export const DEFAULT_FALLBACK_IMAGE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="%23f3f4f6"><rect width="100%" height="100%" fill="%23e5e7eb"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" font-weight="600" fill="%236b7280">하모니넷 HARMONYNET</text></svg>';

export function stripHtml(htmlString: string): string {
  if (!htmlString) return '';
  return htmlString
    .replace(/<[^>]*>?/gm, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim();
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

export function normalizePost(
  post: WPPost,
  fallbackImage: string = DEFAULT_FALLBACK_IMAGE
): NormalizedPost {
  const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0];
  const imageUrl =
    featuredMedia?.media_details?.sizes?.medium_large?.source_url ||
    featuredMedia?.media_details?.sizes?.large?.source_url ||
    featuredMedia?.source_url ||
    fallbackImage;

  const imageAlt = featuredMedia?.alt_text || stripHtml(post.title?.rendered || '') || '하모니넷 기사';

  const authorObj = post._embedded?.['author']?.[0];
  const authorName = authorObj?.name || '하모니넷 편집국';

  const categoriesList = post._embedded?.['wp:term']?.[0] || [];
  const primaryCategory = categoriesList.find((term) => term.taxonomy === 'category');
  const categoryName = primaryCategory?.name || '지역소식';
  const categoryId = primaryCategory?.id || (post.categories?.[0] ?? null);
  const categorySlug = primaryCategory?.slug || 'news';

  return {
    id: post.id,
    slug: post.slug || String(post.id),
    title: stripHtml(post.title?.rendered || '제목 없음'),
    excerpt: stripHtml(post.excerpt?.rendered || ''),
    content: post.content?.rendered || '',
    date: post.date,
    formattedDate: formatDate(post.date),
    imageUrl,
    imageAlt,
    authorName,
    categoryName,
    categoryId,
    categorySlug,
  };
}

export async function fetchPosts(perPage = 13): Promise<{ posts: NormalizedPost[]; error?: string }> {
  const url = `${WP_API_BASE}/posts?_embed&per_page=${perPage}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 60 },
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`WP API HTTP error! status: ${res.status}`);
    }

    const data: WPPost[] = await res.json();
    return { posts: data.map((post) => normalizePost(post)) };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Failed to fetch posts from Harmonynet WP API:', message);
    return { posts: [], error: message };
  }
}
