'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { SectionFooter, SectionHeader } from '@/components/SectionShell';

type WPPage = { id: number; slug: string; title: { rendered: string }; content: { rendered: string } };

const SECTION_NAMES: Record<string, string> = {
  video: '영상뉴스',
  startup: '콘텐츠기업 소개',
};

const SECTION_META: Record<string, { kicker: string; description: string }> = {
  video: { kicker: 'VIDEO NEWS', description: '현장의 목소리와 지역의 변화를 영상으로 전합니다.' },
  startup: { kicker: 'CONTENT COMPANY', description: '지역의 새로운 가치를 만드는 콘텐츠 기업을 소개합니다.' },
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
    <div className="min-h-screen bg-[#f4f4f1] text-[#171817]">
      <SectionHeader />
      <main className="subpage-shell py-8 sm:py-12">
        <div className="section-title-row">
          <div>
            <p className="section-kicker">{SECTION_META[slug]?.kicker || 'HARMONYNET SECTION'}</p>
            <h1>{title}</h1>
          </div>
          <p>{SECTION_META[slug]?.description || '하모니넷의 특별한 이야기를 만나보세요.'}</p>
        </div>
        {loading ? (
          <div className="h-72 animate-pulse bg-neutral-200 dark:bg-neutral-800" />
        ) : page ? (
          <article className="wp-content section-content" dangerouslySetInnerHTML={{ __html: page.content.rendered }} />
        ) : (
          <div className="section-empty"><span>COMING SOON</span><p>새로운 콘텐츠를 준비하고 있습니다.</p><Link href="/">최신 뉴스 보기 →</Link></div>
        )}
      </main>
      <SectionFooter />
    </div>
  );
}
