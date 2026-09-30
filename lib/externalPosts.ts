import { collection, getDocs } from 'firebase/firestore';
import { getDb, isFirebaseConfigured } from '@/lib/firebase';
import { normalizePost } from '@/lib/wp';
import { NormalizedPost, WPPost } from '@/types/post';

export type ExternalCategory = 'local' | 'huss';

export async function fetchExternalCategoryOverrides(): Promise<Map<number, ExternalCategory>> {
  if (!isFirebaseConfigured) return new Map();
  const snapshot = await getDocs(collection(getDb(), 'externalPostCategories'));
  const categories = new Map<number, ExternalCategory>();
  snapshot.docs.forEach((item) => {
    const id = Number(item.id);
    const category = item.data().category;
    if (Number.isInteger(id) && id > 0 && (category === 'local' || category === 'huss')) {
      categories.set(id, category);
    }
  });
  return categories;
}

export function normalizeExternalPost(post: WPPost, overrides: Map<number, ExternalCategory>): NormalizedPost {
  const normalized = normalizePost(post);
  const category = overrides.get(post.id);
  if (!category) return normalized;
  return {
    ...normalized,
    categoryId: category === 'huss' ? 72 : 25,
    categorySlug: category,
    categoryName: category === 'huss' ? '대학소식' : '로컬소식',
  };
}
