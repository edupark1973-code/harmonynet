import { collection, getDocs, query, where } from 'firebase/firestore';
import { getDb, isFirebaseConfigured } from '@/lib/firebase';
import { DEFAULT_FALLBACK_IMAGE } from '@/lib/wp';
import { NormalizedPost } from '@/types/post';

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character] || character);
}

function linkifyText(value: string) {
  return value.split(/(\s+)/).map((token) => {
    const match = token.match(/^(https?:\/\/|www\.)([^\s<]+)$/i);
    if (!match) return token;
    const trailing = token.match(/[.,!?;:)]$/)?.[0] || '';
    const cleanToken = trailing ? token.slice(0, -1) : token;
    const href = cleanToken.toLowerCase().startsWith('www.') ? `https://${cleanToken}` : cleanToken;
    return `<a href="${href}" target="_blank" rel="noopener noreferrer">${cleanToken}</a>${trailing}`;
  }).join('');
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
  const imageUrl = typeof data.imageUrl === 'string' && data.imageUrl ? data.imageUrl : '';
  const bodyHtml = content.split(/\n\s*\n/).map((paragraph) => `<p>${linkifyText(escapeHtml(paragraph).replace(/\n/g, '<br />'))}</p>`).join('');
  const imageHtml = imageUrl ? `<figure><img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(typeof data.imageAlt === 'string' ? data.imageAlt : title)}" /><figcaption>${escapeHtml(title)}</figcaption></figure>` : '';
  return {
    id,
    slug: id,
    title,
    excerpt: content.slice(0, 180),
    content: imageHtml + bodyHtml,
    date,
    formattedDate: new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(date)).replace(/\. /g, '.').replace(/\.$/, ''),
    imageUrl: imageUrl || DEFAULT_FALLBACK_IMAGE,
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

export async function fetchHiddenExternalPostIds(): Promise<Set<number>> {
  if (!isFirebaseConfigured) return new Set();
  try {
    const snapshot = await getDocs(collection(getDb(), 'hiddenExternalPosts'));
    return new Set(snapshot.docs.map((item) => Number(item.id)).filter((id) => Number.isInteger(id) && id > 0));
  } catch (error) {
    console.error('Hidden external posts fetch error:', error);
    return new Set();
  }
}
