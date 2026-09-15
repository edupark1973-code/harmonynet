'use client';

import { useEffect, useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { WPPost, NormalizedPost } from '@/types/post';
import { normalizePost } from '@/lib/wp';
import { fetchHiddenExternalPostIds, fetchPublishedLocalPosts } from '@/lib/localPosts';
import { SectionFooter, SectionHeader } from '@/components/SectionShell';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

const CATEGORY_NAMES: Record<string, string> = {
  huss: '대학소식',
  local: '로컬 소식',
  opinion: '오피니언',
};

const CATEGORY_ENGLISH: Record<string, string> = {
  huss: 'HUSS CAMPUS NEWS',
  local: 'LOCAL & COMMUNITY',
  opinion: 'COLUMNS & PERSPECTIVES',
};

const CATEGORY_IDS: Record<string, number> = { huss: 72, local: 25 };
const WP_POSTS_URL = 'https://huss.harmonynet.kr/wp-json/wp/v2/posts';

export default function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const categoryTitle = CATEGORY_NAMES[slug] || '뉴스 카테고리';

  const [posts, setPosts] = useState<NormalizedPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [visibleListCount, setVisibleListCount] = useState(10);

  useEffect(() => {
    let isMounted = true;
    async function loadCategoryPosts() {
      try {
        setLoading(true);
        if (slug === 'opinion') {
          const localPosts = await fetchPublishedLocalPosts();
          if (isMounted) setPosts(localPosts.filter((post) => post.categorySlug === 'opinion'));
          return;
        }
        const categoryId = CATEGORY_IDS[slug];
        const endpoint = categoryId
          ? `${WP_POSTS_URL}?_embed=1&categories=${categoryId}&per_page=20`
          : `${WP_POSTS_URL}?_embed=1&per_page=20`;
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const [data, hiddenIds] = await Promise.all([res.json() as Promise<WPPost[]>, fetchHiddenExternalPostIds()]);
        if (isMounted) {
          setPosts(data.filter((post) => !hiddenIds.has(post.id)).map((post) => normalizePost(post)));
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

  useEffect(() => {
    setVisibleListCount(10);
  }, [slug]);

  const featuredPost = posts[0];
  const leadSidePosts = posts.slice(1, 3);
  const listPosts = posts.slice(3);

  return (
    <div className="min-h-screen bg-[#f4f4f1] text-[#171817] antialiased">
      <SectionHeader />
      <main className="subpage-shell py-8 sm:py-12">
        <div className="section-title-row">
          <div>
            <p className="section-kicker">{CATEGORY_ENGLISH[slug] || 'HARMONYNET NEWS'}</p>
            <h1>{categoryTitle}</h1>
          </div>
          <p>지역의 오늘을 기록하고<br className="hidden sm:block" /> 내일의 변화를 읽습니다.</p>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 rounded bg-neutral-200 dark:bg-neutral-800"></div>
            ))}
          </div>
        ) : (
          <>
            {slug === 'opinion' ? (
              <section className="opinion-archive">
                <div className="border-b-2 border-neutral-900 pb-5">
                  <p className="text-sm font-semibold leading-7 text-neutral-600">지역과 대학의 오늘을 바라보는 다양한 시선</p>
                  <p className="mt-1 text-xs tracking-wide text-neutral-500">칼럼 · 논평 · 기획 · 제안</p>
                </div>
                {posts.length === 0 ? (
                  <div className="py-20 text-center">
                    <p className="font-serif text-2xl font-bold">아직 등록된 오피니언이 없습니다.</p>
                    <p className="mt-3 text-sm text-neutral-500">하모니넷의 새로운 생각을 기다리고 있습니다.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-300">
                    {posts.slice(0, visibleListCount).map((post, index) => (
                      <article key={post.id} className="group py-7 sm:py-9">
                        <Link href={`/posts/${post.id}`} className="grid gap-4 sm:grid-cols-[72px_minmax(0,1fr)_150px] sm:items-start sm:gap-7">
                          <span className="font-serif text-3xl font-bold text-red-700/80">{String(index + 1).padStart(2, '0')}</span>
                          <div>
                            <span className="text-[10px] font-bold tracking-[0.18em] text-red-700">OPINION</span>
                            <h2 className="mt-2 font-serif text-2xl font-extrabold leading-tight tracking-[-.035em] transition group-hover:text-red-700 sm:text-3xl">{post.title}</h2>
                            <p className="mt-3 line-clamp-2 max-w-2xl text-sm leading-7 text-neutral-600">{post.excerpt}</p>
                          </div>
                          <div className="text-xs text-neutral-500 sm:pt-1 sm:text-right"><p>{post.authorName}</p><time className="mt-2 block">{post.formattedDate}</time></div>
                        </Link>
                      </article>
                    ))}
                  </div>
                )}
                {visibleListCount < posts.length && (
                  <div className="home-report-more mt-6"><button type="button" onClick={() => setVisibleListCount((count) => count + 10)}>더 많은 오피니언 보기 <span>+{Math.min(10, posts.length - visibleListCount)}</span></button></div>
                )}
              </section>
            ) : <section className="category-lead-grid">
              {featuredPost && (
                <article className="category-lead group">
                  <Link href={`/posts/${featuredPost.id}`}>
                    <div className="category-lead-image">
                      <Image
                        src={featuredPost.imageUrl}
                        alt={featuredPost.imageAlt}
                        fill
                        priority
                        unoptimized={featuredPost.imageUrl.startsWith('data:')}
                        className="object-cover transition duration-500 group-hover:scale-[1.02]"
                      />
                    </div>
                    <span className="article-label">TOP STORY · {categoryTitle}</span>
                    <h2>{featuredPost.title}</h2>
                    <p>{featuredPost.excerpt}</p>
                    <time>{featuredPost.formattedDate}</time>
                  </Link>
                </article>
              )}
              <div className="category-lead-side">
                {leadSidePosts.map((post) => (
                  <article key={post.id} className="category-side-story group">
                    <Link href={`/posts/${post.id}`}>
                      <div className="relative aspect-[16/9] overflow-hidden bg-neutral-200">
                        <Image src={post.imageUrl} alt={post.imageAlt} fill unoptimized={post.imageUrl.startsWith('data:')} className="object-cover transition duration-500 group-hover:scale-[1.03]" />
                      </div>
                      <span className="article-label">{categoryTitle}</span>
                      <h3>{post.title}</h3>
                      <p>{post.excerpt}</p>
                    </Link>
                  </article>
                ))}
              </div>
            </section>}
            <section className="latest-section">
              <div className="latest-heading"><h2>최신 기사</h2></div>
              <div className="article-list">
                {listPosts.slice(0, visibleListCount).map((post) => (
                  <article key={post.id} className="article-row group">
                    <Link href={`/posts/${post.id}`} className="article-row-link">
                      <div className="article-row-image">
                        <Image
                          src={post.imageUrl}
                          alt={post.imageAlt}
                          fill
                          unoptimized={post.imageUrl.startsWith('data:')}
                          className="object-cover transition duration-500 group-hover:scale-[1.03]"
                        />
                      </div>
                      <div className="article-row-copy">
                        <span className="article-label">{post.categoryName}</span>
                        <h3>{post.title}</h3>
                        <p>{post.excerpt}</p>
                        <time>{post.formattedDate} · {post.authorName}</time>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
              {visibleListCount < listPosts.length && (
                <div className="home-report-more mt-6">
                  <button type="button" onClick={() => setVisibleListCount((count) => count + 5)}>
                    기사 더보기 <span>+{Math.min(5, listPosts.length - visibleListCount)}</span>
                  </button>
                </div>
              )}
            </section>
          </>
        )}
      </main>
      <SectionFooter />
    </div>
  );
}
