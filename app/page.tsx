'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { WPPost, NormalizedPost } from '@/types/post';
import { normalizePost } from '@/lib/wp';
import SiteFooter from '@/components/SiteFooter';
import SiteLogo from '@/components/SiteLogo';
import SiteNav from '@/components/SiteNav';

const WP_DIRECT_URL = 'https://huss.harmonynet.kr/wp-json/wp/v2/posts?_embed=author,wp:featuredmedia,wp:term&per_page=100&_fields=id,date,slug,title,excerpt,content,categories,featured_media,_embedded';
const PORTFOLIO_URL = 'https://huss.harmonynet.kr/wp-json/wp/v2/portfolio?per_page=100&_embed=1';
type CompanyItem = { id: number; title: { rendered: string }; content: { rendered: string }; _embedded?: { 'wp:featuredmedia'?: { source_url: string }[] } };
const companyImage = (item: CompanyItem) => (item._embedded?.['wp:featuredmedia']?.[0]?.source_url || item.content.rendered.match(/(?:data-src|src)=["']([^"']+)["']/i)?.[1] || '').replace(/^http:\/\//i, 'https://');
const displayCategory = (post: NormalizedPost) => post.categoryId === 72 ? '대학소식' : post.categoryId === 25 ? '지역소식' : post.categoryName;

function NewsThumbnail({ post }: { post: NormalizedPost }) {
  return (
    <article className="home-latest-item group">
      <Link href={`/posts/${post.id}`} className="flex gap-4">
        <div className="relative aspect-[4/3] w-32 shrink-0 overflow-hidden bg-neutral-200 sm:w-40">
          <Image src={post.imageUrl} alt={post.imageAlt} fill sizes="160px" unoptimized={post.imageUrl.startsWith('data:')} className="object-cover transition duration-500 group-hover:scale-105" />
        </div>
        <div className="min-w-0 py-1">
          <span className="text-[10px] font-bold tracking-wide text-red-700">{displayCategory(post)}</span>
          <h3 className="mt-1 line-clamp-2 text-base font-bold leading-snug group-hover:text-red-700 sm:text-[17px]">{post.title}</h3>
          <time className="mt-3 block text-[10px] text-neutral-400">{post.formattedDate}</time>
        </div>
      </Link>
    </article>
  );
}

export default function HomePage() {
  const [posts, setPosts] = useState<NormalizedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleReportCount, setVisibleReportCount] = useState(8);
  const [companyItems, setCompanyItems] = useState<CompanyItem[]>([]);

  useEffect(() => {
    let active = true;
    fetch(WP_DIRECT_URL, { headers: { Accept: 'application/json, text/plain, */*' } })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((data: WPPost[]) => {
        if (active) {
          setPosts(data.map((post) => normalizePost(post)));
          setError(null);
        }
      })
      .catch((reason: unknown) => {
        if (active) setError(`실시간 데이터를 불러오는 중 오류가 발생했습니다 (${reason instanceof Error ? reason.message : 'Unknown error'}).`);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    fetch(PORTFOLIO_URL).then((res) => res.ok ? res.json() : []).then((data: CompanyItem[]) => setCompanyItems([...data].sort(() => Math.random() - 0.5).slice(0, 1))).catch(() => setCompanyItems([]));
  }, []);

  const heroPost = posts[0];
  const latestPosts = posts.slice(1, 5);
  const opinionPosts = posts.slice(5, 8);
  const reportPosts = posts.slice(5);
  const textListPosts = posts.slice(5, 24);
  // 원본 워드프레스의 실제 카테고리 slug(local/huss)로 분야를 분리합니다.
  const localPosts = posts.filter((post) => post.categoryId === 25 || post.categorySlug === 'local').slice(2, 7);
  const universityPosts = posts.filter((post) => post.categoryId === 72 || post.categorySlug === 'huss').slice(2, 7);
  const categoryGroups = useMemo(() => {
    const groups = new Map<string, NormalizedPost[]>();
    posts.forEach((post) => {
      const group = groups.get(post.categoryName) || [];
      if (group.length < 3) group.push(post);
      groups.set(post.categoryName, group);
    });
    return [...groups.entries()].slice(0, 4);
  }, [posts]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-neutral-900 antialiased">
      <div className="border-b border-neutral-800 bg-neutral-900 text-xs text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5">
          <span suppressHydrationWarning>{new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}</span>
          <div className="hidden items-center gap-3 sm:flex"><a href="https://huss.harmonynet.kr" target="_blank" rel="noreferrer" className="hover:text-red-300">웹진보기</a><span className="text-neutral-500">·</span><a href="https://pm100.stibee.com/" target="_blank" rel="noreferrer" className="font-bold text-red-300 hover:text-white">뉴스레터구독</a></div>
        </div>
      </div>

      <header className="border-b border-neutral-300 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6">
          <div className="flex items-center gap-4">
            <SiteLogo className="w-[178px] md:w-[210px]" />
            <span className="hidden border-l border-neutral-300 pl-4 text-xs text-neutral-500 sm:block">대전·세종 로컬기업&대학 뉴스</span>
          </div>
          <form action="/search" method="GET" className="relative hidden items-center md:flex">
            <input name="q" placeholder="검색어를 입력하세요" className="w-72 border-b-2 border-neutral-900 py-2 pr-9 text-sm outline-none focus:border-red-700" />
          </form>
        </div>
        <SiteNav />
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {error && <div className="mb-6 border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}
        {loading ? (
          <div className="grid animate-pulse gap-8 lg:grid-cols-[minmax(0,1.65fr)_minmax(340px,1fr)]"><div className="h-[520px] bg-neutral-200" /><div className="space-y-4">{Array.from({ length: 4 }, (_, i) => <div key={i} className="h-28 bg-neutral-200" />)}</div></div>
        ) : (
          <>
            <section className="home-top-news">
              {heroPost && (
                <article className="home-hero group">
                  <Link href={`/posts/${heroPost.id}`}>
                    <div className="relative aspect-[16/9] overflow-hidden bg-neutral-200">
                      <Image src={heroPost.imageUrl} alt={heroPost.imageAlt} fill priority unoptimized={heroPost.imageUrl.startsWith('data:')} className="object-cover transition duration-700 group-hover:scale-[1.02]" />
                      <span className="absolute left-4 top-4 bg-red-700 px-3 py-1.5 text-[11px] font-bold text-white">{heroPost.categoryName} · 주요 뉴스</span>
                    </div>
                    <h1 className="mt-5 font-serif text-3xl font-extrabold leading-tight tracking-[-.04em] group-hover:text-red-700 md:text-[40px]">{heroPost.title}</h1>
                    <p className="mt-3 line-clamp-2 text-sm leading-7 text-neutral-600">{heroPost.excerpt}</p>
                    <time className="mt-4 block text-[11px] text-neutral-400">{heroPost.authorName} · {heroPost.formattedDate}</time>
                  </Link>
                </article>
              )}
              <div className="home-latest-list">
                <div className="home-section-heading"><h2>최신 뉴스</h2><span>NEW</span></div>
                {latestPosts.map((post) => <NewsThumbnail key={post.id} post={post} />)}
              </div>
            </section>

            <div className="home-lower-grid">
              <div className="space-y-10">
                <section>
                  <div className="home-section-heading"><h2>전체 뉴스</h2></div>
                  <div className="mt-2 grid gap-x-6 md:grid-cols-2">
                    {reportPosts.slice(0, visibleReportCount).map((post) => <NewsThumbnail key={post.id} post={post} />)}
                  </div>
                  {visibleReportCount < reportPosts.length && (
                                       <div className="home-report-more">
                      <button type="button" onClick={() => setVisibleReportCount((count) => count + 4)}>
                        기사 더 보기 <span>+{Math.min(4, reportPosts.length - visibleReportCount)}</span>
                      </button>
                    </div>
                  )}
                </section>
              </div>

              <aside className="home-sidebar">
                <section className="home-side-box hidden">
                  <div className="home-section-heading"><h2>전체 뉴스</h2><span>{textListPosts.length} ARTICLES</span></div>
                  <div className="home-text-news-list">
                    {textListPosts.map((post) => (
                      <article key={post.id}>
                        <Link href={`/posts/${post.id}`}>
                          <span>{post.categoryName}</span>
                          <h3>{post.title}</h3>
                          <time>{post.formattedDate}</time>
                        </Link>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="home-side-box">
                  <div className="home-section-heading"><h2>로컬분야 주요뉴스</h2><Link href="/category/local" className="text-red-700 hover:underline">기사 더보기</Link></div>
                  <ol className="mt-3">
                    {localPosts.map((post, index) => <li key={post.id} className="group flex gap-3 border-b border-neutral-100 py-4 last:border-0"><strong className="text-red-700">{index + 1}</strong><Link href={`/posts/${post.id}`} className="line-clamp-2 text-[15px] font-bold leading-snug group-hover:text-red-700 sm:text-base">{post.title}</Link></li>)}
                    {localPosts.length === 0 && <li className="py-4 text-xs text-neutral-500">로컬 분야 기사가 없습니다.</li>}
                  </ol>
                </section>

                <section className="home-side-box">
                  <div className="home-section-heading"><h2>대학분야 주요뉴스</h2><Link href="/category/huss" className="text-red-700 hover:underline">기사 더보기</Link></div>
                  <div className="mt-2 divide-y divide-neutral-100">
                    {universityPosts.map((post, index) => <Link key={post.id} href={`/posts/${post.id}`} className="flex gap-3 py-3 text-[15px] font-semibold leading-snug hover:text-red-700 sm:text-base"><span className="text-red-700">{index + 1}</span><span className="line-clamp-2">{post.title}</span></Link>)}
                    {universityPosts.length === 0 && <p className="py-4 text-xs text-neutral-500">대학 분야 기사가 없습니다.</p>}
                  </div>
                </section>
                {companyItems[0] && (
                  <section className="home-side-box">
                    <div className="home-section-heading"><h2>로컬기업소개</h2><span>COMPANY</span></div>
                    <article className="group mt-3 overflow-hidden bg-neutral-50">
                      <Link href="/section/startup" className="block">
                        <div className="relative aspect-[16/9] overflow-hidden bg-neutral-200">
                          {companyImage(companyItems[0]) && <Image src={companyImage(companyItems[0])} alt={companyItems[0].title.rendered} fill unoptimized className="object-cover transition duration-500 group-hover:scale-105" />}
                        </div>
                        <h3 className="p-4 text-sm font-bold leading-snug group-hover:text-red-700">{companyItems[0].title.rendered.replace(/<[^>]*>/g, '')}</h3>
                      </Link>
                    </article>
                  </section>
                )}
              </aside>
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
