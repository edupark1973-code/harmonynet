import { collection, getDocs, query, where } from 'firebase/firestore';
import { getDb, isFirebaseConfigured } from '@/lib/firebase';
import { DEFAULT_FALLBACK_IMAGE } from '@/lib/wp';
import { NormalizedPost } from '@/types/post';

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character] || character);
}

function toDateString(value: unknown) {
  if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }
  if (typeof value === 'string') return value;
  return new Date().toISOString();
}

export function normalizeLocalPost(id: string, data: Record<string, unknown>): NormalizedPost {
  const title = typeof data.title === 'string' ? data.title : '제목 없음';
  const content = typeof data.content === 'string' ? data.content : '';
  const date = toDateString(data.createdAt);
  const category = typeof data.category === 'string' ? data.category : 'local';
  return {
    id,
    slug: id,
    title,
    excerpt: content.slice(0, 180),
    content: content.split(/\n\s*\n/).map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br />')}</p>`).join(''),
    date,
    formattedDate: new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(date)).replace(/\. /g, '.').replace(/\.$/, ''),
    imageUrl: typeof data.imageUrl === 'string' && data.imageUrl ? data.imageUrl : DEFAULT_FALLBACK_IMAGE,
    imageAlt: title,
    authorName: typeof data.authorName === 'string' ? data.authorName : '하모니넷 작성자',
    categoryName: category === 'huss' ? 'HUSS소식' : category === 'opinion' ? '오피니언' : '로컬소식',
    categoryId: null,
    categorySlug: category,
  };
}

export async function fetchPublishedLocalPosts(): Promise<NormalizedPost[]> {
  if (!isFirebaseConfigured) return [];
  try {
    const postsQuery = query(collection(getDb(), 'localPosts'), where('status', '==', 'published'));
    const snapshot = await getDocs(postsQuery);
    return snapshot.docs
      .map((item) => normalizeLocalPost(`local-${item.id}`, item.data()))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Local posts fetch error:', error);
    return [];
  }
}
