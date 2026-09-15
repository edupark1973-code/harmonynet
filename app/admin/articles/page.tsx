'use client';

import Link from 'next/link';
import { collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { getDb } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';
import { SectionHeader } from '@/components/SectionShell';
import SiteFooter from '@/components/SiteFooter';

type LocalArticle = {
  id: string;
  title: string;
  authorName: string;
  category: string;
  status: string;
  createdAt?: { seconds?: number };
};

export default function AdminArticlesPage() {
  const { user, role, loading } = useAuth();
  const [articles, setArticles] = useState<LocalArticle[]>([]);
  const [message, setMessage] = useState('');

  async function loadArticles() {
    if (role !== 'admin') return;
    const snapshot = await getDocs(collection(getDb(), 'localPosts'));
    const nextArticles = snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as LocalArticle));
    nextArticles.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    setArticles(nextArticles);
  }

  useEffect(() => {
    loadArticles().catch(() => setMessage('기사를 불러오지 못했습니다.'));
  }, [role]);

  async function changeStatus(id: string, status: 'published' | 'rejected') {
    await updateDoc(doc(getDb(), 'localPosts', id), { status, updatedAt: new Date().toISOString() });
    setMessage(status === 'published' ? '기사를 공개했습니다.' : '기사를 반려했습니다.');
    await loadArticles();
  }

  async function removeArticle(id: string) {
    if (!window.confirm('이 기사를 삭제할까요?')) return;
    await deleteDoc(doc(getDb(), 'localPosts', id));
    setMessage('기사를 삭제했습니다.');
    await loadArticles();
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-neutral-900 antialiased">
      <SectionHeader />
      <main className="mx-auto w-full max-w-5xl px-4 py-10">
        <p className="text-xs font-bold tracking-[0.2em] text-red-700">HARMONYNET ADMIN</p>
        <h1 className="mt-2 font-serif text-3xl font-extrabold">자체 기사 관리</h1>
        {loading ? <div className="mt-8 h-32 animate-pulse rounded bg-neutral-200" /> : !user || role !== 'admin' ? (
          <div className="mt-8 rounded-lg border border-neutral-200 bg-white p-6 text-sm">관리자 권한이 필요합니다.</div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
            {articles.length === 0 ? <p className="p-6 text-sm text-neutral-500">등록된 자체 기사가 없습니다.</p> : <div className="divide-y divide-neutral-200">{articles.map((article) => <article key={article.id} className="p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><span className="text-xs font-bold text-red-700">{article.status}</span><h2 className="mt-1 font-serif text-lg font-bold">{article.title}</h2><p className="mt-1 text-xs text-neutral-500">{article.authorName} · {article.category}</p></div><div className="flex flex-wrap gap-2 text-xs"><button onClick={() => changeStatus(article.id, 'published')} className="rounded bg-red-700 px-3 py-2 font-bold text-white">공개</button><button onClick={() => changeStatus(article.id, 'rejected')} className="rounded border border-neutral-300 px-3 py-2 font-bold">반려</button><button onClick={() => removeArticle(article.id)} className="rounded border border-red-200 px-3 py-2 font-bold text-red-700">삭제</button></div></div></article>)}</div>}
            {message && <p className="border-t border-neutral-200 bg-neutral-50 p-4 text-sm text-red-700">{message}</p>}
          </div>
        )}
        <Link href="/" className="mt-6 inline-block text-sm font-semibold text-neutral-500 hover:text-red-700">← 메인으로 돌아가기</Link>
      </main>
      <SiteFooter />
    </div>
  );
}
