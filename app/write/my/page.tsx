'use client';

import Link from 'next/link';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { getDb } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';
import { SectionHeader } from '@/components/SectionShell';
import SiteFooter from '@/components/SiteFooter';

type MyArticle = { id: string; title?: string; status?: string; category?: string; content?: string };

export default function MyArticlesPage() {
  const { user, loading } = useAuth();
  const [articles, setArticles] = useState<MyArticle[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    getDocs(query(collection(getDb(), 'localPosts'), where('authorId', '==', user.uid)))
      .then((snapshot) => setArticles(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as MyArticle))))
      .catch(() => setError('내 기사를 불러오지 못했습니다.'));
  }, [user]);

  return <div className="min-h-screen bg-[#f8f9fa] text-neutral-900 antialiased"><SectionHeader /><main className="mx-auto w-full max-w-3xl px-4 py-10"><p className="text-xs font-bold tracking-[0.2em] text-red-700">MY ARTICLES</p><h1 className="mt-2 font-serif text-3xl font-extrabold">내 기사</h1>{loading ? <div className="mt-8 h-32 animate-pulse rounded bg-neutral-200" /> : !user ? <div className="mt-8 rounded-lg border border-neutral-200 bg-white p-6 text-sm">로그인이 필요합니다.</div> : <div className="mt-8 divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white shadow-sm">{articles.length === 0 ? <p className="p-6 text-sm text-neutral-500">작성한 기사가 없습니다.</p> : articles.map((article) => <article key={article.id} className="flex items-center justify-between gap-4 p-5"><div className="min-w-0"><span className="text-xs font-bold text-red-700">{article.status}</span><h2 className="mt-1 truncate font-serif text-lg font-bold">{article.title || '제목 없음'}</h2><p className="mt-1 text-xs text-neutral-500">{article.category || 'local'}</p></div><Link href={`/write/edit/${article.id}`} className="shrink-0 rounded border border-neutral-300 px-3 py-2 text-xs font-bold hover:border-red-700 hover:text-red-700">수정</Link></article>)}</div>}{error && <p className="mt-3 text-sm text-red-700">{error}</p>}<Link href="/write" className="mt-6 inline-block text-sm font-semibold text-neutral-500 hover:text-red-700">새 기사 작성</Link></main><SiteFooter /></div>;
}
