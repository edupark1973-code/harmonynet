'use client';

import { useEffect, useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { WPPost, NormalizedPost } from '@/types/post';
import { normalizePost } from '@/lib/wp';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import SiteLogo from '@/components/SiteLogo';

const WP_POSTS_URL = 'https://huss.harmonynet.kr/wp-json/wp/v2/posts';

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export default function PostPage({ params }: PostPageProps) {
  const resolvedParams = use(params);
  const postIdOrSlug = resolvedParams.id;

  const [post, setPost] = useState<NormalizedPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<NormalizedPost[]>([]);
  const [allNewsPosts, setAllNewsPosts] = useState<NormalizedPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');

  useEffect(() => {
    let isMounted = true;

    async function loadSpecificPost() {
      try {
        setLoading(true);
        setError(null);

        const isNumericId = /^\d+$/.test(postIdOrSlug);
        let targetUrl = `${WP_POSTS_URL}?_embed=1&include=${encodeURIComponent(postIdOrSlug)}&per_page=1`;

        if (!isNumericId) {
          targetUrl = `${WP_POSTS_URL}?_embed=1&slug=${encodeURIComponent(decodeURIComponent(postIdOrSlug))}&per_page=1`;
        }

        const res = await fetch(targetUrl);

        if (!res.ok) {
          throw new Error(`기사를 불러오는 중 오류가 발생했습니다 (${res.status})`);
        }

        const data = await res.json();
        let targetWPPost: WPPost | null = null;

        if (Array.isArray(data)) {
          targetWPPost = data[0] || null;
        } else if (data && data.id) {
          targetWPPost = data;
        }

        // 관련 기사 및 인기 랭킹용 기사 5건 추가 페치
        const listRes = await fetch(`${WP_POSTS_URL}?_embed=1&per_page=24`);
        let listData: WPPost[] = [];
        if (listRes.ok) {
          listData = await listRes.json();
        }

        if (isMounted) {
          if (targetWPPost) {
            setPost(normalizePost(targetWPPost));
          } else {
            setError('해당 기사를 찾을 수 없습니다.');
          }

          const normalizedList = listData
            .map((p) => normalizePost(p))
            .filter((p) => p.id !== targetWPPost?.id);
          setRelatedPosts(normalizedList.slice(0, 5));
          setAllNewsPosts(normalizedList);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          console.error('Post detail fetch error:', message);
          setError(message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadSpecificPost();

    return () => {
      isMounted = false;
    };
  }, [postIdOrSlug]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-100">
      
      {/* 1. 최상단 유틸리티 바 */}
      <div className="border-b border-neutral-200 bg-white text-xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
          <div className="flex items-center space-x-3 text-neutral-600 dark:text-neutral-400">
            <span>|</span>
            <span>기사 뷰어</span>
          </div>
          <Link href="/" className="text-neutral-600 hover:text-red-700 dark:text-neutral-400">
            ← 메인 홈으로 돌아가기
          </Link>
        </div>
      </div>

      {/* 2. 헤더 */}
      <header className="border-b border-neutral-300 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <SiteLogo className="w-[150px] sm:w-[178px]" />

          {/* 폰트 크기 조절 유틸리티 */}
          <div className="flex items-center space-x-2 text-xs font-semibold">
            <span className="text-neutral-500">글자크기:</span>
            <button
              onClick={() => setFontSize('sm')}
              className={`px-2 py-0.5 rounded border ${fontSize === 'sm' ? 'bg-neutral-900 text-white dark:bg-white dark:text-black' : 'bg-neutral-100 dark:bg-neutral-800'}`}
            >
              작게
            </button>
            <button
              onClick={() => setFontSize('base')}
              className={`px-2 py-0.5 rounded border ${fontSize === 'base' ? 'bg-neutral-900 text-white dark:bg-white dark:text-black' : 'bg-neutral-100 dark:bg-neutral-800'}`}
            >
              보통
            </button>
            <button
              onClick={() => setFontSize('lg')}
              className={`px-2 py-0.5 rounded border ${fontSize === 'lg' ? 'bg-neutral-900 text-white dark:bg-white dark:text-black' : 'bg-neutral-100 dark:bg-neutral-800'}`}
            >
              크게
            </button>
          </div>
        </div>
        <SiteNav />
      </header>

      {/* 3. 본문 레이아웃 (기사 + 사이드바) */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        {loading ? (
          <div className="mx-auto max-w-4xl h-96 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
        ) : error ? (
          <div className="my-12 text-center py-12 bg-white rounded border border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800">
            <p className="text-red-700 dark:text-red-400 font-bold mb-4">{error}</p>
            <Link href="/" className="inline-block rounded bg-red-700 px-4 py-2 text-xs font-bold text-white">
              메인 홈으로 이동
            </Link>
          </div>
        ) : post ? (
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            
            {/* 좌측 기사 본문 영역 (8-Cols) */}
            <article className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-lg border border-neutral-200 shadow-sm dark:bg-neutral-900 dark:border-neutral-800">
              
              {/* 기사 헤더 메타 */}
              <div className="mb-6 border-b border-neutral-200 pb-6 dark:border-neutral-800">
                <span className="inline-block rounded bg-red-700 px-3 py-1 text-xs font-bold text-white mb-3">
                  {post.categoryName}
                </span>
                <h1 className="font-serif text-3xl font-extrabold leading-tight text-neutral-900 dark:text-white md:text-4xl">
                  {post.title}
                </h1>
                
                <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-neutral-500 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">{post.authorName} 기자</span>
                    <span>•</span>
                    <span>입력: {post.formattedDate}</span>
                  </div>
                  <div className="flex space-x-2 mt-2 sm:mt-0">
                    <button onClick={() => window.print()} className="hover:text-red-700">인쇄</button>
                    <span>|</span>
                    <button onClick={() => navigator.clipboard?.writeText(window.location.href)} className="hover:text-red-700">URL 복사</button>
                  </div>
                </div>
              </div>

              {/* 핵심 요약 하이라이트 박스 */}
              {post.excerpt && (
                <div className="mb-6 rounded-lg bg-neutral-50 p-4 border-l-4 border-red-700 font-serif text-sm font-semibold leading-relaxed text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                  💡 {post.excerpt}
                </div>
              )}

              {/* 대표 이미지 */}
              {post.imageUrl && (
                <div className="mb-8">
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded bg-neutral-100 dark:bg-neutral-800">
                    <Image
                      src={post.imageUrl}
                      alt={post.imageAlt}
                      fill
                      unoptimized={post.imageUrl.startsWith('data:')}
                      className="object-cover"
                    />
                  </div>
                  <p className="mt-2 text-center text-xs text-neutral-500">
                    ▲ {post.imageAlt} (사진=하모니넷 DB)
                  </p>
                </div>
              )}

              {/* 기사 본문 (폰트 크기 동적 조절) */}
              <div
                className={`wp-content article-body prose prose-zinc max-w-none font-serif leading-relaxed dark:prose-invert prose-headings:font-serif prose-a:text-red-700 ${
                  fontSize === 'sm' ? 'text-sm' : fontSize === 'lg' ? 'text-lg leading-loose' : 'text-base'
                }`}
                dangerouslySetInnerHTML={{ __html: post.content || post.excerpt }}
              />

              {/* 기자 바이오 / 제보 안내 박스 */}
              <div className="mt-10 rounded-lg bg-neutral-50 p-5 border border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700">
                <h4 className="font-serif font-bold text-sm text-neutral-900 dark:text-white">
                  {post.authorName} 기자 (하모니넷 편집국)
                </h4>
                <p className="mt-1 text-xs text-neutral-500">
                  대전·세종 지역 현장의 소식을 진실하게 전달합니다. 독자 여러분의 제보를 받습니다. (contact@harmonynet.kr)
                </p>
              </div>

            </article>

            {/* 우측 사이드바 (4-Cols): 관련 기사 & 인기 랭킹 */}
            <aside className="lg:col-span-4 space-y-6">
              
              {/* 관련 주요 기사 */}
              <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm dark:bg-neutral-900 dark:border-neutral-800">
                <h3 className="font-serif text-lg font-bold border-b-2 border-red-700 pb-2 text-neutral-900 dark:border-red-500 dark:text-white">
                  관련 주요 기사
                </h3>
                <div className="mt-4 space-y-4">
                  {relatedPosts.map((relPost) => (
                    <div key={relPost.id} className="group border-b border-neutral-100 pb-3 last:border-0 dark:border-neutral-800">
                      <span className="text-[11px] font-bold text-red-700 dark:text-red-400">
                        {relPost.categoryName}
                      </span>
                      <h4 className="mt-1 line-clamp-2 text-xs font-bold leading-snug text-neutral-800 group-hover:text-red-700 dark:text-neutral-200">
                        <Link href={`/posts/${relPost.id}`}>{relPost.title}</Link>
                      </h4>
                      <span className="mt-1 block text-[10px] text-neutral-400">{relPost.formattedDate}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm dark:bg-neutral-900 dark:border-neutral-800">
                <h3 className="font-serif text-lg font-bold border-b-2 border-neutral-900 pb-2 text-neutral-900 dark:border-neutral-200 dark:text-white">
                  전체 뉴스
                </h3>
                <div className="mt-2 divide-y divide-neutral-100 dark:divide-neutral-800">
                  {allNewsPosts.map((newsPost) => (
                    <Link key={newsPost.id} href={`/posts/${newsPost.id}`} className="group block py-3 first:pt-1">
                      <span className="text-[10px] font-bold text-red-700 dark:text-red-400">{newsPost.categoryName}</span>
                      <h4 className="mt-1 line-clamp-2 text-xs font-semibold leading-snug text-neutral-800 group-hover:text-red-700 dark:text-neutral-200">{newsPost.title}</h4>
                      <time className="mt-1 block text-[10px] text-neutral-400">{newsPost.formattedDate}</time>
                    </Link>
                  ))}
                </div>
              </div>

            </aside>
          </div>
        ) : (
          <div className="py-12 text-center text-neutral-500">기사를 찾을 수 없습니다.</div>
        )}
      </main>

      <SiteFooter />

    </div>
  );
}
