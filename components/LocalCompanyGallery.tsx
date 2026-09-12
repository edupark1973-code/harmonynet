'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { stripHtml } from '@/lib/wp';

type PortfolioTerm = { id: number; name: string; taxonomy: string };
type PortfolioMedia = { source_url: string; alt_text?: string };
type PortfolioItem = {
  id: number;
  link: string;
  title: { rendered: string };
  content: { rendered: string };
  portfolio_category: number[];
  _embedded?: {
    'wp:featuredmedia'?: PortfolioMedia[];
    'wp:term'?: PortfolioTerm[][];
  };
};

const API_BASE = 'https://huss.harmonynet.kr/wp-json/wp/v2';
const PAGE_SIZE = 12;

function getImage(item: PortfolioItem) {
  const featured = item._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  const contentImage = item.content.rendered.match(/(?:data-src|src)=["']([^"']+)["']/i)?.[1];
  return (featured || contentImage || '').replace(/^http:\/\/huss\.harmonynet\.kr/i, 'https://huss.harmonynet.kr');
}

function getTerms(item: PortfolioItem) {
  return (item._embedded?.['wp:term']?.flat() || []).filter((term) => term.taxonomy === 'portfolio_category');
}

export default function LocalCompanyGallery() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState<PortfolioItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`${API_BASE}/portfolio?per_page=100&_embed=1`)
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.json();
      })
      .then((data: PortfolioItem[]) => { if (active) setItems(data); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const categories = useMemo(() => {
    const termMap = new Map<number, { id: number; name: string; count: number }>();
    items.forEach((item) => getTerms(item).forEach((term) => {
      const current = termMap.get(term.id);
      termMap.set(term.id, { id: term.id, name: term.name, count: (current?.count || 0) + 1 });
    }));
    return [...termMap.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'ko'));
  }, [items]);

  const filteredItems = items.filter((item) => {
    const matchesCategory = activeCategory === null || item.portfolio_category.includes(activeCategory);
    const matchesName = !searchQuery.trim() || stripHtml(item.title.rendered).toLocaleLowerCase('ko-KR').includes(searchQuery.trim().toLocaleLowerCase('ko-KR'));
    return matchesCategory && matchesName;
  });
  const visibleItems = filteredItems.slice(0, visibleCount);

  function selectCategory(categoryId: number | null) {
    setActiveCategory(categoryId);
    setVisibleCount(PAGE_SIZE);
  }

  if (loading) {
    return <div className="company-gallery-grid" aria-label="기업 목록을 불러오는 중">{Array.from({ length: 8 }, (_, index) => <div key={index} className="company-card-skeleton" />)}</div>;
  }

  if (error) {
    return <div className="section-empty"><span>LOAD ERROR</span><p>기업 정보를 불러오지 못했습니다.</p><button type="button" onClick={() => location.reload()}>다시 시도 →</button></div>;
  }

  return (
    <section aria-label="로컬기업 목록">
      <div className="company-filter" role="group" aria-label="기업 분류">
        <label className="company-search">
          <span className="sr-only">기업명 검색</span>
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => { setSearchQuery(event.target.value); setVisibleCount(PAGE_SIZE); }}
            placeholder="기업명 검색"
            aria-label="기업명 검색"
          />
        </label>
        <button type="button" className={activeCategory === null ? 'is-active' : ''} onClick={() => selectCategory(null)}>전체 <span>{items.length}</span></button>
        {categories.map((category) => (
          <button key={category.id} type="button" className={activeCategory === category.id ? 'is-active' : ''} onClick={() => selectCategory(category.id)}>
            {category.name} <span>{category.count}</span>
          </button>
        ))}
      </div>

      <div className="company-gallery-grid">
        {visibleItems.map((item) => {
          const imageUrl = getImage(item);
          const title = stripHtml(item.title.rendered);
          const terms = getTerms(item);
          return (
            <button key={item.id} type="button" className="company-card group" onClick={() => setSelected(item)} aria-label={`${title} 자세히 보기`}>
              <span className="company-card-image">
                {imageUrl ? <Image src={imageUrl} alt={title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" /> : <span className="company-image-empty">HARMONYNET</span>}
              </span>
              <span className="company-card-copy">
                <small>{terms.slice(0, 2).map((term) => term.name).join(' · ') || '로컬기업'}</small>
                <strong>{title}</strong>
                <span>기업 정보 보기 →</span>
              </span>
            </button>
          );
        })}
      </div>

      {visibleCount < filteredItems.length && (
        <div className="company-more-wrap"><button type="button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>더 많은 기업 보기 <span>{filteredItems.length - visibleCount}</span></button></div>
      )}

      {selected && (
        <div className="company-modal" role="dialog" aria-modal="true" aria-label={`${stripHtml(selected.title.rendered)} 기업 정보`} onClick={() => setSelected(null)}>
          <div className="company-modal-card" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="company-modal-close" onClick={() => setSelected(null)} aria-label="닫기">×</button>
            <div className="company-modal-image">
              {getImage(selected) ? (
                <Image src={getImage(selected)} alt={stripHtml(selected.title.rendered)} fill sizes="(max-width: 760px) 100vw, 760px" className="object-contain" />
              ) : (
                <span className="company-image-empty">HARMONYNET</span>
              )}
            </div>
            <div className="company-modal-copy">
              <small>{getTerms(selected).map((term) => term.name).join(' · ')}</small>
              <h2>{stripHtml(selected.title.rendered)}</h2>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
