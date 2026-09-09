'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';

type WPPage = { id: number; slug: string; title: { rendered: string }; content: { rendered: string } };

const SECTION_NAMES: Record<string, string> = {
  video: '영상뉴스',
  startup: '콘텐츠기업 소개',
};

export default function SectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [page, setPage] = useState<WPPage | null>(null);
  const [loading, setLoading] = useState(true);
  const title = SECTION_NAMES[slug] || '하모니넷';

  useEffect(() => {
    let active = true;
    fetch(`https://huss.harmonynet.kr/wp-json/wp/v2/pages?slug=${encodeURIComponent(slug)}`)
      .then((response) => response.ok ? response.json() : [])
      .then((data: WPPage[]) => { if (active) setPage(data[0] || null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <header className="bg-white dark:bg-neutral-900">
        <div className="mx-auto flex max-w-7xl items-end justify-between px-4 py-5 sm:py-7">
          <Link href="/" className="font-serif text-3xl font-extrabold tracking-tight sm:text-4xl">하모니<span className="text-red-700">넷</span></Link>
          <span className="hidden text-xs text-neutral-500 sm:block">대전·충청 로컬 콘텐츠 미디어</span>
        </div>
        <SiteNav />
      </header>
      <main className="mx-auto max-w-7xl px-4 py-7 sm:py-10">
        <div className="mb-7 border-b-2 border-neutral-900 pb-4 dark:border-neutral-100">
          <p className="mb-2 text-xs font-bold text-red-700">HARMONYNET SECTION</p>
          <h1 className="font-serif text-3xl font-extrabold sm:text-4xl">{title}</h1>
        </div>
        {loading ? (
          <div className="h-72 animate-pulse bg-neutral-200 dark:bg-neutral-800" />
        ) : page ? (
          <article className="wp-content mx-auto max-w-6xl bg-white p-5 shadow-sm sm:p-8 dark:bg-neutral-900" dangerouslySetInnerHTML={{ __html: page.content.rendered }} />
        ) : (
          <div className="border bg-white p-12 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900">페이지 콘텐츠를 준비 중입니다.</div>
        )}
      </main>
    </div>
  );
}
