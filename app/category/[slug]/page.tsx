'use client';

import { useEffect, useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { WPPost, NormalizedPost } from '@/types/post';
import { normalizePost } from '@/lib/wp';
import { SectionFooter, SectionHeader } from '@/components/SectionShell';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

const CATEGORY_NAMES: Record<string, string> = {
  huss: 'HUSS 소식',
  local: '로컬 소식',
};

const CATEGORY_ENGLISH: Record<string, string> = {
  huss: 'HUSS CAMPUS NEWS',
  local: 'LOCAL & COMMUNITY',
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
            <section className="category-lead-grid">
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
            </section>
            <section className="latest-section">
              <div className="latest-heading"><h2>최신 기사</h2><span>{posts.length} ARTICLES</span></div>
              <div className="article-list">
                {listPosts.map((post) => (
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
            </section>
          </>
        )}
      </main>
      <SectionFooter />
    </div>
  );
}
