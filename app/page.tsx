import Image from 'next/image';
import Link from 'next/link';
import { fetchPosts } from '@/lib/wp';
import { NormalizedPost } from '@/types/post';

export const revalidate = 60; // 60초 주기 ISR (Incremental Static Regeneration)

export default async function HomePage() {
  const { posts, error } = await fetchPosts(13);

  // 헤드라인 기사 (첫번째) 및 보조 기사 분리
  const heroPost: NormalizedPost | undefined = posts[0];
  const subHeroPosts: NormalizedPost[] = posts.slice(1, 4);
  const gridPosts: NormalizedPost[] = posts.slice(4);

  return (
    <div className="min-h-screen bg-neutral-100 font-sans text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-100">
      {/* 1. 상단 브랜딩 & GNB (한국형 포털 뉴스 헤더) */}
      <header className="border-b border-neutral-300 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        {/* 최상단 ユーティリティ 바 */}
        <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-1.5 text-xs text-neutral-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-red-600 dark:text-red-500">[속보]</span>
              <span className="truncate max-w-md md:max-w-xl">
                {heroPost ? heroPost.title : '하모니넷 대전·충청 지역 창업 생태계 소식 안내'}
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-neutral-500">
              <span>{new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}</span>
              <a href="https://harmonynet.kr" target="_blank" rel="noreferrer" className="hover:underline">
                기존 워드프레스
              </a>
            </div>
          </div>
        </div>

        {/* 로고 & 메인 타이틀 영역 */}
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6">
          <div className="flex flex-col">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                하모니<span className="text-red-600">넷</span>
              </span>
              <span className="rounded bg-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                인터넷 신문
              </span>
            </Link>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              대전·충청 지역 창업 생태계 & 스타트업 미디어 플랫폼
            </p>
          </div>

          {/* 검색 영역 */}
          <div className="hidden md:flex items-center">
            <form action="/search" method="GET" className="relative flex items-center">
              <input
                type="text"
                name="q"
                placeholder="기사 키워드 검색..."
                className="w-64 rounded-full border border-neutral-300 bg-neutral-50 px-4 py-1.5 text-sm focus:border-red-600 focus:bg-white focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:border-red-500"
              />
              <button
                type="submit"
                className="absolute right-2 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700 transition"
              >
                검색
              </button>
            </form>
          </div>
        </div>

        {/* 카테고리 GNB (Global Navigation Bar) */}
        <nav className="border-t border-neutral-200 bg-neutral-900 text-white dark:border-neutral-800">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 text-sm font-semibold">
            <div className="flex items-center space-x-1 overflow-x-auto py-2.5">
              <Link href="/" className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700">
                홈
              </Link>
              <Link href="/category/region" className="px-3 py-1 hover:text-red-400 transition">
                지역소식
              </Link>
              <Link href="/category/startup" className="px-3 py-1 hover:text-red-400 transition">
                창업·스타트업
              </Link>
              <Link href="/category/opinion" className="px-3 py-1 hover:text-red-400 transition">
                오피니언/칼럼
              </Link>
              <Link href="/category/support" className="px-3 py-1 hover:text-red-400 transition">
                정부지원사업
              </Link>
              <Link href="/category/culture" className="px-3 py-1 hover:text-red-400 transition">
                사회/문화
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* 2. 본문 컨텐츠 (Hero & High-density News Grid) */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            <strong>API 연결 알림:</strong> 워드프레스 데이터를 불러오는 중 오류가 발생했습니다 ({error}). 기본 템플릿 화면을 표시합니다.
          </div>
        )}

        {/* [Hero Section] 최상단 헤드라인 기사 (1개 강조 + 3개 보조) */}
        {heroPost ? (
          <section className="mb-8 border-b border-neutral-300 pb-8 dark:border-neutral-800">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* 메인 1위 헤드라인 (Left 8-cols) */}
              <div className="group lg:col-span-8 border-b lg:border-b-0 lg:border-r border-neutral-200 pr-0 lg:pr-6 dark:border-neutral-800">
                <Link href={`/posts/${heroPost.slug}`} className="block">
                  <div className="relative mb-4 aspect-[16/9] w-full overflow-hidden rounded-lg bg-neutral-200 dark:bg-neutral-800">
                    <Image
                      src={heroPost.imageUrl}
                      alt={heroPost.imageAlt}
                      fill
                      priority
                      unoptimized={heroPost.imageUrl.startsWith('data:')}
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute left-3 top-3 rounded bg-red-600 px-2.5 py-1 text-xs font-bold text-white shadow">
                      {heroPost.categoryName} · 주요뉴스
                    </div>
                  </div>
                  <h1 className="mb-2 text-2xl font-bold leading-snug tracking-tight text-neutral-900 group-hover:text-red-600 dark:text-white dark:group-hover:text-red-400 md:text-3xl">
                    {heroPost.title}
                  </h1>
                  <p className="mb-3 line-clamp-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                    {heroPost.excerpt || '하모니넷에서 제공하는 최신 대전·충청 지역 창업 생태계 뉴스입니다.'}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                    <span>{heroPost.authorName}</span>
                    <span>•</span>
                    <span>{heroPost.formattedDate}</span>
                  </div>
                </Link>
              </div>

              {/* 보조 헤드라인 3개 (Right 4-cols) */}
              <div className="flex flex-col justify-between space-y-4 lg:col-span-4">
                <h2 className="border-b border-neutral-900 pb-2 text-sm font-bold text-neutral-900 dark:border-white dark:text-white">
                  헤드라인 기사
                </h2>
                {subHeroPosts.map((post) => (
                  <div key={post.id} className="group border-b border-neutral-200 pb-3 last:border-0 dark:border-neutral-800">
                    <Link href={`/posts/${post.slug}`} className="flex items-start gap-3">
                      <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded bg-neutral-200 dark:bg-neutral-800">
                        <Image
                          src={post.imageUrl}
                          alt={post.imageAlt}
                          fill
                          unoptimized={post.imageUrl.startsWith('data:')}
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="mb-1 text-[11px] font-semibold text-red-600 dark:text-red-400">
                          {post.categoryName}
                        </span>
                        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-neutral-800 group-hover:text-red-600 dark:text-neutral-200 dark:group-hover:text-red-400">
                          {post.title}
                        </h3>
                        <span className="mt-1 text-[11px] text-neutral-500">{post.formattedDate}</span>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : (
          <div className="py-12 text-center text-neutral-500">등록된 기사가 없습니다.</div>
        )}

        {/* [Middle Section] 한국형 포털 뉴스 스탠드 3열 고밀도 리스트 */}
        <section>
          <div className="mb-4 flex items-center justify-between border-b-2 border-neutral-900 pb-2 dark:border-white">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              최신 뉴스 목록
            </h2>
            <span className="text-xs text-neutral-500">정보 밀도 최적화 뷰</span>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {gridPosts.map((post) => (
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
                    <span className="absolute left-2 top-2 rounded bg-neutral-900/80 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur">
                      {post.categoryName}
                    </span>
                  </div>

                  <h3 className="mb-2 line-clamp-2 text-base font-bold leading-snug text-neutral-900 group-hover:text-red-600 dark:text-neutral-100 dark:group-hover:text-red-400">
                    <Link href={`/posts/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h3>

                  <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                    {post.excerpt}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-neutral-100 pt-2 text-[11px] text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                  <span>{post.authorName}</span>
                  <span>{post.formattedDate}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* 3. 푸터 영역 (언론사 표준 하단) */}
      <footer className="mt-12 border-t border-neutral-300 bg-neutral-900 py-8 text-xs text-neutral-400 dark:border-neutral-800">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-4 flex flex-wrap items-center gap-4 text-sm font-semibold text-neutral-200">
            <Link href="/" className="hover:text-white">회사소개</Link>
            <span>|</span>
            <Link href="/" className="hover:text-white">기자단 안내</Link>
            <span>|</span>
            <Link href="/" className="hover:text-white">개인정보 처리방침</Link>
            <span>|</span>
            <Link href="/" className="hover:text-white">고충처리인</Link>
          </div>
          <p className="leading-relaxed">
            하모니넷 (Harmonynet) | 대전·충청 창업 생태계 전문 인터넷 신문 <br />
            사이트 주소: https://harmonynet.kr | 등록번호: 대전 아00000 | 발행인: 편집국 <br />
            Copyright © Harmonynet. All rights reserved. Powered by Next.js & Headless WordPress.
          </p>
        </div>
      </footer>
    </div>
  );
}
