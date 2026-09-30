'use client';

import Link from 'next/link';
import { collection, deleteDoc, doc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { getDb } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';
import { SectionHeader } from '@/components/SectionShell';
import SiteFooter from '@/components/SiteFooter';
import { ExternalCategory, fetchExternalCategoryOverrides, normalizeExternalPost } from '@/lib/externalPosts';
import { WPPost } from '@/types/post';

const WP_POSTS_URL = 'https://huss.harmonynet.kr/wp-json/wp/v2/posts';

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
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [externalId, setExternalId] = useState('');
  const [externalPosts, setExternalPosts] = useState<WPPost[]>([]);
  const [externalCategories, setExternalCategories] = useState<Map<number, ExternalCategory>>(new Map());
  const [externalSearch, setExternalSearch] = useState('');
  const [externalPage, setExternalPage] = useState(1);
  const [externalHasNext, setExternalHasNext] = useState(false);
  const [externalLoading, setExternalLoading] = useState(false);

  async function loadArticles() {
    if (role !== 'admin') return;
    const snapshot = await getDocs(collection(getDb(), 'localPosts'));
    const nextArticles = snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as LocalArticle));
    nextArticles.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    setArticles(nextArticles);
  }

  async function loadHiddenIds() {
    if (role !== 'admin') return;
    const snapshot = await getDocs(collection(getDb(), 'hiddenExternalPosts'));
    setHiddenIds(snapshot.docs.map((item) => item.id).sort((a, b) => Number(a) - Number(b)));
  }

  async function loadExternalPosts(search = externalSearch, page = externalPage) {
    if (role !== 'admin') return;
    setExternalLoading(true);
    try {
      const params = new URLSearchParams({ _embed: '1', per_page: '20', page: String(page) });
      if (/^\d+$/.test(search.trim())) params.set('include', search.trim());
      else if (search.trim()) params.set('search', search.trim());
      const response = await fetch(`${WP_POSTS_URL}?${params}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const [posts, categories] = await Promise.all([
        response.json() as Promise<WPPost[]>,
        fetchExternalCategoryOverrides(),
      ]);
      setExternalPosts(posts);
      setExternalCategories(categories);
      setExternalHasNext(posts.length === 20);
      setExternalPage(page);
    } catch (error) {
      setMessage(`가져온 기사를 불러오지 못했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setExternalLoading(false);
    }
  }

  useEffect(() => {
    void Promise.resolve().then(() => Promise.all([loadArticles(), loadHiddenIds(), loadExternalPosts('', 1)]))
      .catch(() => setMessage('데이터를 불러오지 못했습니다.'));
    // Loading functions use the role from this render; reload when the role changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  async function hideExternalArticle(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = externalId.trim();
    if (!/^\d+$/.test(id)) {
      setMessage('휴스하모니넷 기사 ID를 숫자로 입력해 주세요.');
      return;
    }
    await setDoc(doc(getDb(), 'hiddenExternalPosts', id), {
      source: 'huss',
      externalId: Number(id),
      hiddenBy: user?.email || '',
      hiddenAt: new Date().toISOString(),
    });
    setExternalId('');
    setMessage(`기사 ${id}를 하모니넷에서 숨겼습니다.`);
    await loadHiddenIds();
  }

  async function restoreExternalArticle(id: string) {
    await deleteDoc(doc(getDb(), 'hiddenExternalPosts', id));
    setMessage(`기사 ${id}를 다시 표시합니다.`);
    await loadHiddenIds();
  }

  async function setExternalCategory(post: WPPost, category: string) {
    const reference = doc(getDb(), 'externalPostCategories', String(post.id));
    try {
      if (category === 'original') {
        await deleteDoc(reference);
      } else if (category === 'local' || category === 'huss') {
        await setDoc(reference, {
          category,
          updatedBy: user?.email || '',
          updatedAt: new Date().toISOString(),
        });
      } else return;
      setExternalCategories((previous) => {
        const next = new Map(previous);
        if (category === 'original') next.delete(post.id);
        else next.set(post.id, category as ExternalCategory);
        return next;
      });
      setMessage('하모니넷 기사 분류를 저장했습니다.');
    } catch (error) {
      setMessage(`분류를 저장하지 못했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  async function toggleExternalArticle(id: number) {
    try {
      if (hiddenIds.includes(String(id))) await restoreExternalArticle(String(id));
      else {
        await setDoc(doc(getDb(), 'hiddenExternalPosts', String(id)), {
          source: 'huss',
          externalId: id,
          hiddenBy: user?.email || '',
          hiddenAt: new Date().toISOString(),
        });
        setMessage(`기사 ${id}를 하모니넷에서 숨겼습니다.`);
        await loadHiddenIds();
      }
    } catch (error) {
      setMessage(`기사 표시 상태를 바꾸지 못했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-neutral-900 antialiased">
      <SectionHeader />
      <main className="mx-auto w-full max-w-5xl px-4 py-10">
        <p className="text-xs font-bold tracking-[0.2em] text-red-700">HARMONYNET ADMIN</p>
        <h1 className="mt-2 font-serif text-3xl font-extrabold">기사 관리</h1>
        {loading ? <div className="mt-8 h-32 animate-pulse rounded bg-neutral-200" /> : !user || role !== 'admin' ? (
          <div className="mt-8 rounded-lg border border-neutral-200 bg-white p-6 text-sm">관리자 권한이 필요합니다.</div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
            {articles.length === 0 ? <p className="p-6 text-sm text-neutral-500">등록된 자체 기사가 없습니다.</p> : <div className="divide-y divide-neutral-200">{articles.map((article) => <article key={article.id} className="p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><span className="text-xs font-bold text-red-700">{article.status}</span><h2 className="mt-1 font-serif text-lg font-bold">{article.title}</h2><p className="mt-1 text-xs text-neutral-500">{article.authorName} · {article.category}</p></div><div className="flex flex-wrap gap-2 text-xs"><button onClick={() => changeStatus(article.id, 'published')} className="rounded bg-red-700 px-3 py-2 font-bold text-white">공개</button><button onClick={() => changeStatus(article.id, 'rejected')} className="rounded border border-neutral-300 px-3 py-2 font-bold">반려</button><button onClick={() => removeArticle(article.id)} className="rounded border border-red-200 px-3 py-2 font-bold text-red-700">삭제</button></div></div></article>)}</div>}
            {message && <p className="border-t border-neutral-200 bg-neutral-50 p-4 text-sm text-red-700">{message}</p>}
          </div>
        )}
        <Link href="/" className="mt-6 inline-block text-sm font-semibold text-neutral-500 hover:text-red-700">← 메인으로 돌아가기</Link>
        {user && role === 'admin' && (
          <section className="mt-8 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="font-serif text-xl font-bold">가져온 기사 관리</h2>
            <p className="mt-2 text-sm text-neutral-600">기사 표시와 분류 변경은 하모니넷에만 적용됩니다. 휴스하모니넷 원본은 유지됩니다.</p>
            <form onSubmit={(event) => { event.preventDefault(); void loadExternalPosts(externalSearch, 1); }} className="mt-5 flex max-w-xl gap-2">
              <input value={externalSearch} onChange={(event) => setExternalSearch(event.target.value)} className="min-w-0 flex-1 rounded border border-neutral-300 px-3 py-2 text-sm" placeholder="제목 또는 기사 ID로 검색" aria-label="가져온 기사 검색" />
              <button className="rounded bg-neutral-900 px-4 py-2 text-sm font-bold text-white">검색</button>
            </form>
            {externalLoading ? <p className="mt-5 text-sm text-neutral-500">기사를 불러오는 중입니다.</p> : externalPosts.length === 0 ? <p className="mt-5 text-sm text-neutral-500">표시할 기사가 없습니다.</p> : (
              <div className="mt-5 divide-y divide-neutral-200 border-y border-neutral-200">
                {externalPosts.map((post) => {
                  const article = normalizeExternalPost(post, externalCategories);
                  const hidden = hiddenIds.includes(String(post.id));
                  return <article key={post.id} className="py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-neutral-500">ID {post.id} · {post.date.slice(0, 10)} · {hidden ? '하모니넷에서 숨김' : '표시 중'}</p>
                        <Link href={`/posts/${post.id}`} className="mt-1 block font-semibold hover:text-red-700">{article.title}</Link>
                        <p className="mt-1 text-xs text-neutral-500">현재 분류: {article.categoryName}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="text-xs font-semibold" htmlFor={`category-${post.id}`}>하모니넷 분류</label>
                        <select id={`category-${post.id}`} value={externalCategories.get(post.id) || 'original'} onChange={(event) => void setExternalCategory(post, event.target.value)} className="rounded border border-neutral-300 px-2 py-2 text-xs">
                          <option value="original">원본 분류</option>
                          <option value="local">로컬소식</option>
                          <option value="huss">대학소식</option>
                        </select>
                        <button type="button" onClick={() => void toggleExternalArticle(post.id)} className={`rounded border px-3 py-2 text-xs font-bold ${hidden ? 'border-neutral-300' : 'border-red-200 text-red-700'}`}>{hidden ? '다시 표시' : '하모니넷에서 숨기기'}</button>
                      </div>
                    </div>
                  </article>;
                })}
              </div>
            )}
            <div className="mt-4 flex items-center justify-between text-sm">
              <button type="button" disabled={externalLoading || externalPage <= 1} onClick={() => void loadExternalPosts(externalSearch, externalPage - 1)} className="disabled:opacity-40">← 이전</button>
              <span>{externalPage} 페이지</span>
              <button type="button" disabled={externalLoading || !externalHasNext} onClick={() => void loadExternalPosts(externalSearch, externalPage + 1)} className="disabled:opacity-40">다음 →</button>
            </div>
            <h3 className="mt-8 text-sm font-bold">기사 ID로 숨기기</h3>
            <p className="mt-1 text-xs text-neutral-500">목록에 없는 오래된 기사도 ID로 숨길 수 있습니다.</p>
            <form onSubmit={hideExternalArticle} className="mt-4 flex max-w-xl gap-2">
              <input value={externalId} onChange={(event) => setExternalId(event.target.value)} inputMode="numeric" className="min-w-0 flex-1 rounded border border-neutral-300 px-3 py-2 text-sm" placeholder="휴스 기사 ID (예: 8493)" />
              <button className="rounded bg-neutral-900 px-4 py-2 text-sm font-bold text-white">하모니넷에서 숨기기</button>
            </form>
            {hiddenIds.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{hiddenIds.map((id) => <button key={id} onClick={() => restoreExternalArticle(id)} className="rounded-full border border-red-200 px-3 py-1 text-xs text-red-700 hover:bg-red-50">기사 {id} ×</button>)}</div>}
            {message && <p role="status" className="mt-4 text-sm text-red-700">{message}</p>}
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
