'use client';

import { useEffect, useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { WPPost, NormalizedPost } from '@/types/post';
import { normalizePost } from '@/lib/wp';
import SiteNav from '@/components/SiteNav';

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = use(searchParams);
  const query = resolvedSearchParams.q || '';

  const [posts, setPosts] = useState<NormalizedPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadSearchPosts() {
      try {
        setLoading(true);
        const endpoint = query ? `/api/posts?search=${encodeURIComponent(query)}&per_page=20` : '/api/posts?per_page=20';
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data: WPPost[] = await res.json();
        if (isMounted) {
          setPosts(data.map((post) => normalizePost(post)));
        }
      } catch (err) {
        console.error('Search fetch error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadSearchPosts();
    return () => {
      isMounted = false;
    };
  }, [query]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-100">
      
      <div className="border-b border-neutral-200 bg-white text-xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
          <div className="flex items-center space-x-3 text-neutral-600 dark:text-neutral-400">
            <span className="font-bold text-red-700 dark:text-red-500">경향스타일 하모니넷</span>
            <span>|</span>
            <span>기사 통합검색</span>
          </div>
          <Link href="/" className="text-neutral-600 hover:text-red-700 dark:text-neutral-400">
            ← 메인 홈으로 돌아가기
          </Link>
        </div>
      </div>

      <header className="border-b border-neutral-300 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6">
          <Link href="/" className="font-serif text-3xl font-extrabold tracking-tight text-neutral-900 hover:text-red-700 dark:text-white">
            하모니<span className="text-red-700 dark:text-red-500">넷</span>
          </Link>
        </div>
        <SiteNav />
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 rounded-lg bg-white p-6 border border-neutral-200 shadow-sm dark:bg-neutral-900 dark:border-neutral-800">
          <h1 className="font-serif text-2xl font-bold text-neutral-900 dark:text-white">
            검색 결과: <span className="text-red-700 dark:text-red-500">&quot;{query || '전체 기사'}&quot;</span>
          </h1>
          <p className="mt-1 text-xs text-neutral-500">
            총 {posts.length}건의 기사가 검색되었습니다.
          </p>

          <form action="/search" method="GET" className="mt-4 flex max-w-xl items-center gap-2">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="검색어를 재입력하세요"
              className="flex-1 rounded border border-neutral-300 px-4 py-2 text-sm focus:border-red-700 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800"
            />
            <button
              type="submit"
              className="rounded bg-red-700 px-5 py-2 text-sm font-bold text-white hover:bg-red-800 transition"
            >
              검색
            </button>
          </form>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 rounded bg-neutral-200 dark:bg-neutral-800"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="group flex flex-col justify-between rounded-lg border border-neutral-200 bg-white p-4 transition shadow-sm hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div>
                  <div className="relative mb-3 aspect-[16/9] w-full overflow-hidden rounded bg-neutral-100 dark:bg-neutral-800">
                    <Image
                      src={post.imageUrl}
                      alt={post.imageAlt}
                      fill
                      unoptimized={post.imageUrl.startsWith('data:')}
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <span className="absolute top-2 left-2 rounded bg-neutral-900/80 px-2 py-0.5 text-[10px] font-medium text-white">
                      {post.categoryName}
                    </span>
                  </div>

                  <h2 className="mb-2 line-clamp-2 font-serif text-base font-bold text-neutral-900 group-hover:text-red-700 dark:text-neutral-100">
                    <Link href={`/posts/${post.id}`}>{post.title}</Link>
                  </h2>

                  <p className="mb-3 line-clamp-2 text-xs text-neutral-600 dark:text-neutral-400">
                    {post.excerpt}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-neutral-100 pt-2 text-[11px] text-neutral-500 dark:border-neutral-800">
                  <span>{post.authorName}</span>
                  <span>{post.formattedDate}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <footer className="mt-16 border-t-2 border-neutral-900 bg-neutral-900 text-neutral-400 dark:border-neutral-700">
        <div className="mx-auto max-w-7xl px-4 py-8 text-xs leading-relaxed space-y-2">
          <p>하모니넷 (Harmonynet) | 대전광역시 등록 인터넷 신문 | 신문 등록번호: 대전 아00000</p>
          <p>Copyright © Harmonynet. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
