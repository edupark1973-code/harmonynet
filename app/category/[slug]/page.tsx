'use client';

import { useEffect, useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { WPPost, NormalizedPost } from '@/types/post';
import { normalizePost } from '@/lib/wp';
import SiteNav from '@/components/SiteNav';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

const CATEGORY_NAMES: Record<string, string> = {
  huss: 'HUSS 소식',
  local: '로컬 소식',
};

const CATEGORY_IDS: Record<string, number> = { huss: 72, local: 25 };
const WP_POSTS_URL = 'https://huss.harmonynet.kr/wp-json/wp/v2/posts';

export default function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const categoryTitle = CATEGORY_NAMES[slug] || '뉴스 카테고리';

  const [posts, setPosts] = useState<NormalizedPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadCategoryPosts() {
      try {
        setLoading(true);
        const categoryId = CATEGORY_IDS[slug];
        const endpoint = categoryId
          ? `${WP_POSTS_URL}?_embed=1&categories=${categoryId}&per_page=20`
          : `${WP_POSTS_URL}?_embed=1&per_page=20`;
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data: WPPost[] = await res.json();
        if (isMounted) {
          setPosts(data.map((post) => normalizePost(post)));
        }
      } catch (err) {
        console.error('Category fetch error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCategoryPosts();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const featuredPost = posts[0];
  const listPosts = posts.slice(1);
  const topRanked = posts.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-100">
      
      {/* 1. 최상단 유틸리티 바 */}
      <div className="border-b border-neutral-200 bg-white text-xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
          <div className="flex items-center space-x-3 text-neutral-600 dark:text-neutral-400">
            <span className="font-bold text-red-700 dark:text-red-500">경향스타일 하모니넷</span>
            <span>|</span>
            <span>{new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}</span>
          </div>
          <Link href="/" className="text-neutral-600 hover:text-red-700 dark:text-neutral-400">
            ← 메인 홈으로
          </Link>
        </div>
      </div>

      {/* 2. 헤더 & 로고 */}
      <header className="border-b border-neutral-300 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6">
          <Link href="/" className="font-serif text-3xl font-extrabold tracking-tight text-neutral-900 hover:text-red-700 dark:text-white dark:hover:text-red-500 md:text-4xl">
            하모니<span className="text-red-700 dark:text-red-500">넷</span>
          </Link>

          <form action="/search" method="GET" className="relative hidden md:flex items-center">
            <input
              type="text"
              name="q"
              placeholder="카테고리 내 검색"
              className="w-64 border-b-2 border-neutral-900 bg-transparent py-1 pr-6 text-sm font-medium focus:border-red-700 focus:outline-none dark:border-white"
            />
            <button type="submit" className="absolute right-0 text-neutral-900 hover:text-red-700 dark:text-white">
              🔍
            </button>
          </form>
        </div>

        <SiteNav />
      </header>

      {/* 4. 카테고리 헤더 타이틀 */}
      <section className="bg-white border-b border-neutral-200 py-6 dark:bg-neutral-900 dark:border-neutral-800">
        <div className="mx-auto max-w-7xl px-4 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-extrabold text-neutral-900 dark:text-white flex items-center">
              <span className="inline-block w-3 h-3 bg-red-700 mr-3"></span>
              {categoryTitle}
            </h1>
            <p className="mt-1 text-xs text-neutral-500">
              하모니넷에서 제공하는 {categoryTitle} 분야의 깊이있는 주요 기사 및 리포트입니다.
            </p>
          </div>
          <span className="hidden sm:inline-block rounded-full bg-neutral-100 px-4 py-1.5 text-xs font-bold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
            총 {posts.length}개의 기사
          </span>
        </div>
      </section>

      {/* 5. 메인 기사 목록 (경향 2단 레이아웃 + 사이드바) */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 rounded bg-neutral-200 dark:bg-neutral-800"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            
            {/* 좌측/중앙 기사 영역 (8-Cols) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* 카테고리 1위 메인 대표 기사 */}
              {featuredPost && (
                <article className="group border-b-2 border-neutral-300 pb-6 dark:border-neutral-800">
                  <Link href={`/posts/${featuredPost.id}`} className="block">
                    <div className="relative mb-4 aspect-[16/9] w-full overflow-hidden rounded bg-neutral-200 shadow-sm dark:bg-neutral-800">
                      <Image
                        src={featuredPost.imageUrl}
                        alt={featuredPost.imageAlt}
                        fill
                        priority
                        unoptimized={featuredPost.imageUrl.startsWith('data:')}
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute top-3 left-3 bg-red-700 px-3 py-1 text-xs font-bold text-white shadow">
                        주요 기사
                      </span>
                    </div>
                    <h2 className="font-serif text-2xl font-bold leading-tight text-neutral-900 group-hover:text-red-700 dark:text-white dark:group-hover:text-red-400 md:text-3xl">
                      {featuredPost.title}
                    </h2>
                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                      {featuredPost.excerpt}
                    </p>
                    <div className="mt-3 flex items-center space-x-3 text-xs text-neutral-500">
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">{featuredPost.authorName}</span>
                      <span>•</span>
                      <span>{featuredPost.formattedDate}</span>
                    </div>
                  </Link>
                </article>
              )}

              {/* 카테고리 기사 2열 고밀도 리스트 */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {listPosts.map((post) => (
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
                      </div>

                      <h3 className="mb-2 line-clamp-2 font-serif text-base font-bold leading-snug text-neutral-900 group-hover:text-red-700 dark:text-neutral-100 dark:group-hover:text-red-400">
                        <Link href={`/posts/${post.id}`}>{post.title}</Link>
                      </h3>

                      <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
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
            </div>

            {/* 우측 사이드바 (4-Cols) */}
            <aside className="lg:col-span-4 space-y-6 border-l border-neutral-200 pl-0 lg:pl-8 dark:border-neutral-800">
              
              {/* 많이 본 뉴스 Top 5 */}
              <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm dark:bg-neutral-900 dark:border-neutral-800">
                <h3 className="font-serif text-lg font-bold border-b-2 border-neutral-900 pb-2 text-neutral-900 dark:border-white dark:text-white flex items-center justify-between">
                  <span>{categoryTitle} 랭킹</span>
                  <span className="text-xs text-red-700 dark:text-red-500 font-semibold">인기</span>
                </h3>
                <div className="mt-4 space-y-4">
                  {topRanked.map((post, idx) => (
                    <div key={post.id} className="group flex items-start space-x-3 border-b border-neutral-100 pb-3 last:border-0 dark:border-neutral-800">
                      <span className={`flex h-6 w-6 flex-shrink-0 items-center justify-center font-serif text-base font-extrabold ${idx < 3 ? 'text-red-700 dark:text-red-500' : 'text-neutral-400'}`}>
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <h4 className="line-clamp-2 text-xs font-bold leading-snug text-neutral-800 group-hover:text-red-700 dark:text-neutral-200">
                          <Link href={`/posts/${post.id}`}>{post.title}</Link>
                        </h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </aside>
          </div>
        )}
      </main>

      {/* 푸터 */}
      <footer className="mt-16 border-t-2 border-neutral-900 bg-neutral-900 text-neutral-400 dark:border-neutral-700">
        <div className="mx-auto max-w-7xl px-4 py-8 text-xs leading-relaxed space-y-2">
          <p>하모니넷 (Harmonynet) | 대전광역시 등록 인터넷 신문 | 신문 등록번호: 대전 아00000</p>
          <p>Copyright © Harmonynet. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
