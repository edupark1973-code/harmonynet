'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { WPPost, NormalizedPost } from '@/types/post';
import { normalizePost } from '@/lib/wp';
import SiteNav from '@/components/SiteNav';

const WP_DIRECT_URL = 'https://huss.harmonynet.kr/wp-json/wp/v2/posts?_embed&per_page=15';

export default function HomePage() {
  const [posts, setPosts] = useState<NormalizedPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadClientPosts() {
      try {
        setLoading(true);
        const res = await fetch(WP_DIRECT_URL, {
          headers: {
            'Accept': 'application/json, text/plain, */*',
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data: WPPost[] = await res.json();
        if (isMounted) {
          setPosts(data.map((post) => normalizePost(post)));
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          console.error('Client WP Fetch error:', message);
          setError(`실시간 데이터를 불러오는 중 오류가 발생했습니다 (${message}).`);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadClientPosts();

    return () => {
      isMounted = false;
    };
  }, []);

  // 경향신문 스타일 영역별 기사 배분
  const heroPost: NormalizedPost | undefined = posts[0];
  const subHeroPosts: NormalizedPost[] = posts.slice(1, 4);
  const opinionPosts: NormalizedPost[] = posts.slice(4, 7);
  const mainGridPosts: NormalizedPost[] = posts.slice(7, 13);
  const topRankedPosts: NormalizedPost[] = posts.slice(0, 5); // 많이 본 뉴스 Ranking

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-100">
      
      {/* 1. 최상단 유틸리티 헤더 (경향신문 상단 바 스타일) */}
      <div className="border-b border-neutral-200 bg-white text-xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
          <div className="flex items-center space-x-3 text-neutral-600 dark:text-neutral-400">
            <span className="font-bold text-red-700 dark:text-red-500">경향스타일 하모니넷</span>
            <span>|</span>
            <span>{new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}</span>
          </div>

          <div className="flex items-center space-x-4 text-neutral-600 dark:text-neutral-400">
            <a href="https://harmonynet.kr" target="_blank" rel="noreferrer" className="hover:text-red-700 hover:underline">
              지면보기
            </a>
            <span>•</span>
            <Link href="/" className="hover:text-red-700 hover:underline">
              기자단 지원
            </Link>
            <span>•</span>
            <Link href="/" className="font-semibold text-neutral-900 dark:text-white hover:text-red-700">
              구독신청
            </Link>
          </div>
        </div>
      </div>

      {/* 2. 경향신문 특유의 볼드 로고 & 검색 헤더 */}
      <header className="border-b border-neutral-300 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6">
          {/* 브랜드 로고 (경향신문풍 볼드 타이포그래피 + 레드 포인트) */}
          <div className="flex items-baseline space-x-3">
            <Link href="/" className="group flex items-baseline">
              <span className="font-serif text-4xl font-extrabold tracking-tight text-neutral-900 group-hover:text-red-700 dark:text-white dark:group-hover:text-red-500 md:text-5xl">
                하모니<span className="text-red-700 dark:text-red-500">넷</span>
              </span>
            </Link>
            <span className="hidden text-xs font-medium text-neutral-500 dark:text-neutral-400 sm:inline-block border-l border-neutral-300 pl-3 dark:border-neutral-700">
              진실을 담는 대전·충청 지역 언론
            </span>
          </div>

          {/* 우측 검색바 & 속보 알림 */}
          <div className="flex items-center space-x-4">
            <form action="/search" method="GET" className="relative hidden md:flex items-center">
              <input
                type="text"
                name="q"
                placeholder="검색어를 입력하세요"
                className="w-72 border-b-2 border-neutral-900 bg-transparent py-1.5 pr-8 text-sm font-medium focus:border-red-700 focus:outline-none dark:border-white dark:focus:border-red-500"
              />
              <button
                type="submit"
                className="absolute right-0 py-1 text-neutral-900 hover:text-red-700 dark:text-white"
                aria-label="검색"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>
        </div>

        <SiteNav />
      </header>

      {/* 4. 메인 콘텐츠 영역 (경향신문 3단 계층 레이아웃) */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        {error && (
          <div className="mb-6 rounded border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          /* 로딩 스켈레톤 */
          <div className="space-y-8 animate-pulse">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="h-96 rounded bg-neutral-200 dark:bg-neutral-800 lg:col-span-8"></div>
              <div className="space-y-4 lg:col-span-4">
                <div className="h-28 rounded bg-neutral-200 dark:bg-neutral-800"></div>
                <div className="h-28 rounded bg-neutral-200 dark:bg-neutral-800"></div>
                <div className="h-28 rounded bg-neutral-200 dark:bg-neutral-800"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            
            {/* [메인 좌측/중앙 영역 (8-Cols)]: 메인 헤드라인 & 분야별 주요 뉴스 */}
            <div className="lg:col-span-8 space-y-10">
              
              {/* [Top Hero Headline] 1위 대형 기사 + 3개 서브 기사 */}
              {heroPost && (
                <section className="border-b-2 border-neutral-300 pb-8 dark:border-neutral-800">
                  <div className="group mb-6">
                    <Link href={`/posts/${heroPost.id}`} className="block">
                      <div className="relative mb-4 aspect-[16/9] w-full overflow-hidden rounded bg-neutral-200 shadow-sm dark:bg-neutral-800">
                        <Image
                          src={heroPost.imageUrl}
                          alt={heroPost.imageAlt}
                          fill
                          priority
                          unoptimized={heroPost.imageUrl.startsWith('data:')}
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <span className="absolute top-3 left-3 bg-red-700 px-3 py-1 text-xs font-bold text-white shadow">
                          {heroPost.categoryName} · 주요 뉴스
                        </span>
                      </div>
                      <h1 className="font-serif text-2xl font-extrabold leading-tight text-neutral-900 group-hover:text-red-700 dark:text-white dark:group-hover:text-red-400 md:text-3xl">
                        {heroPost.title}
                      </h1>
                      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                        {heroPost.excerpt || '하모니넷이 다루는 대전·충청 지역의 주요 현안 및 이슈 기사입니다.'}
                      </p>
                      <div className="mt-3 flex items-center space-x-3 text-xs text-neutral-500">
                        <span className="font-semibold text-neutral-800 dark:text-neutral-200">{heroPost.authorName}</span>
                        <span>•</span>
                        <span>{heroPost.formattedDate}</span>
                      </div>
                    </Link>
                  </div>

                  {/* 서브 헤드라인 3열 카드 */}
                  <div className="grid grid-cols-1 gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-800 sm:grid-cols-3">
                    {subHeroPosts.map((post) => (
                      <div key={post.id} className="group flex flex-col justify-between border-r border-neutral-200 pr-3 last:border-0 dark:border-neutral-800">
                        <Link href={`/posts/${post.id}`} className="block">
                          <span className="text-[11px] font-bold text-red-700 dark:text-red-400">
                            {post.categoryName}
                          </span>
                          <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-neutral-900 group-hover:text-red-700 dark:text-neutral-100 dark:group-hover:text-red-400">
                            {post.title}
                          </h3>
                          <span className="mt-2 block text-[11px] text-neutral-400">{post.formattedDate}</span>
                        </Link>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* [오피니언 & 칼럼 섹션 (경향신문 사설 스타일)] */}
              {opinionPosts.length > 0 && (
                <section className="bg-neutral-100 p-6 rounded-lg border border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800">
                  <div className="mb-4 flex items-center justify-between border-b border-neutral-300 pb-2 dark:border-neutral-700">
                    <h2 className="font-serif text-xl font-bold text-neutral-900 dark:text-white flex items-center">
                      <span className="inline-block w-2.5 h-2.5 bg-red-700 mr-2"></span>
                      오피니언 & 시선
                    </h2>
                    <Link href="/category/opinion" className="text-xs text-neutral-500 hover:text-red-700">
                      더보기 +
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {opinionPosts.map((post) => (
                      <div key={post.id} className="bg-white p-4 rounded border border-neutral-200 shadow-sm dark:bg-neutral-800 dark:border-neutral-700">
                        <span className="text-[11px] font-semibold text-neutral-500">{post.authorName} 칼럼</span>
                        <h3 className="mt-1 font-serif text-sm font-bold leading-snug text-neutral-900 hover:text-red-700 dark:text-white">
                          <Link href={`/posts/${post.id}`}>{post.title}</Link>
                        </h3>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* [뉴스 그리드 섹션] 주요 소식 포털 리스트 */}
              <section>
                <div className="mb-6 flex items-center justify-between border-b-2 border-neutral-900 pb-2 dark:border-white">
                  <h2 className="font-serif text-xl font-bold text-neutral-900 dark:text-white flex items-center">
                    <span className="inline-block w-2.5 h-2.5 bg-neutral-900 dark:bg-white mr-2"></span>
                    기획 & 최신 리포트
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {mainGridPosts.map((post) => (
                    <article
                      key={post.id}
                      className="group flex gap-4 border-b border-neutral-200 pb-5 dark:border-neutral-800"
                    >
                      <div className="relative h-20 w-32 flex-shrink-0 overflow-hidden rounded bg-neutral-200 dark:bg-neutral-800">
                        <Image
                          src={post.imageUrl}
                          alt={post.imageAlt}
                          fill
                          unoptimized={post.imageUrl.startsWith('data:')}
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="flex flex-col justify-between">
                        <div>
                          <span className="text-[11px] font-bold text-red-700 dark:text-red-400">
                            {post.categoryName}
                          </span>
                          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-neutral-900 group-hover:text-red-700 dark:text-neutral-100 dark:group-hover:text-red-400">
                            <Link href={`/posts/${post.id}`}>{post.title}</Link>
                          </h3>
                        </div>
                        <span className="text-[11px] text-neutral-400">{post.formattedDate}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>

            {/* [우측 사이드바 영역 (4-Cols)]: 많이 본 뉴스 Ranking & 이슈 키워드 */}
            <aside className="lg:col-span-4 space-y-8 border-l border-neutral-200 pl-0 lg:pl-8 dark:border-neutral-800">
              
              {/* 많이 본 뉴스 Top 5 (경향신문 랭킹 스타일) */}
              <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm dark:bg-neutral-900 dark:border-neutral-800">
                <h2 className="font-serif text-lg font-bold border-b-2 border-neutral-900 pb-2 text-neutral-900 dark:border-white dark:text-white flex items-center justify-between">
                  <span>많이 본 뉴스</span>
                  <span className="text-xs font-normal text-red-700 dark:text-red-500">실시간</span>
                </h2>
                <div className="mt-4 space-y-4">
                  {topRankedPosts.map((post, idx) => (
                    <div key={post.id} className="group flex items-start space-x-3 border-b border-neutral-100 pb-3 last:border-0 dark:border-neutral-800">
                      <span className={`flex h-6 w-6 flex-shrink-0 items-center justify-center font-serif text-base font-extrabold ${idx < 3 ? 'text-red-700 dark:text-red-500' : 'text-neutral-400'}`}>
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <h3 className="line-clamp-2 text-xs font-bold leading-snug text-neutral-800 group-hover:text-red-700 dark:text-neutral-200 dark:group-hover:text-red-400">
                          <Link href={`/posts/${post.id}`}>{post.title}</Link>
                        </h3>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 이슈 태그 클라우드 */}
              <div className="bg-neutral-50 p-5 rounded-lg border border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800">
                <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">
                  주요 이슈 키워드
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['#대전창업', '#스타트업', '#지원사업', '#충청소식', '#테크기업', '#오피니언', '#지역경제'].map((tag) => (
                    <Link
                      key={tag}
                      href="/search?q=창업"
                      className="rounded-full bg-white px-3 py-1 text-xs font-medium text-neutral-700 border border-neutral-300 hover:border-red-700 hover:text-red-700 transition dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>

              {/* 기자단 및 창업 제보 배너 */}
              <div className="rounded-lg bg-neutral-900 p-6 text-white text-center shadow-md dark:bg-neutral-800">
                <h3 className="font-serif text-lg font-bold">하모니넷 기사 제보</h3>
                <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
                  대전·충청 지역 스타트업 및 주민 소식을 제보해 주세요. 진실된 뉴스로 답하겠습니다.
                </p>
                <button className="mt-4 w-full rounded bg-red-700 py-2 text-xs font-bold text-white hover:bg-red-800 transition">
                  기사 제보하기
                </button>
              </div>

            </aside>
          </div>
        )}
      </main>

      {/* 5. 경향신문 스타일 하단 푸터 */}
      <footer className="mt-16 border-t-2 border-neutral-900 bg-neutral-900 text-neutral-400 dark:border-neutral-700">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="flex flex-wrap items-center justify-between border-b border-neutral-800 pb-6 mb-6">
            <div className="font-serif text-2xl font-extrabold text-white">
              하모니<span className="text-red-600">넷</span>
            </div>
            <div className="flex space-x-6 text-xs font-semibold text-neutral-300">
              <Link href="/" className="hover:text-white">회사소개</Link>
              <Link href="/" className="hover:text-white">기자윤리강령</Link>
              <Link href="/" className="hover:text-white font-bold text-white">개인정보 처리방침</Link>
              <Link href="/" className="hover:text-white">청소년 보호정책</Link>
              <Link href="/" className="hover:text-white">고충처리인</Link>
            </div>
          </div>

          <div className="text-xs leading-relaxed space-y-2 text-neutral-400">
            <p>
              하모니넷 (Harmonynet) | 대전광역시 등록 인터넷 신문 | 신문 등록번호: 대전 아00000 | 발행인·편집인: 편집국
            </p>
            <p>
              주소: 대전광역시 | 대표전화: 042-000-0000 | 기사제보 및 문의: contact@harmonynet.kr
            </p>
            <p className="text-neutral-500 pt-2">
              Copyright © Harmonynet. All rights reserved. 본 콘텐츠의 무단 전재 및 재배포를 금합니다.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
