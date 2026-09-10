import Link from 'next/link';
import SiteNav from '@/components/SiteNav';

export function SectionHeader() {
  return (
    <>
      <div className="subpage-topline">
        <div className="subpage-shell flex items-center justify-between">
          <span>HARMONYNET NEWS</span>
          <span className="hidden sm:inline">지역과 대학, 사람을 잇는 콘텐츠 미디어</span>
          <span>{new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }).format(new Date())}</span>
        </div>
      </div>
      <header className="subpage-header">
        <div className="subpage-shell flex items-center justify-between py-5 sm:py-7">
          <Link href="/" className="subpage-brand" aria-label="하모니넷 홈">
            <strong>하모니<span>넷</span></strong>
            <small>HARMONYNET · LOCAL CONTENT MEDIA</small>
          </Link>
          <form action="/search" className="subpage-search hidden md:flex">
            <label htmlFor="subpage-search" className="sr-only">기사 검색</label>
            <input id="subpage-search" name="q" placeholder="뉴스 검색" />
            <button aria-label="검색" type="submit">⌕</button>
          </form>
        </div>
        <SiteNav />
      </header>
    </>
  );
}

export function SectionFooter() {
  return (
    <footer className="subpage-footer">
      <div className="subpage-shell subpage-footer-grid">
        <div>
          <strong className="text-xl text-white">하모니넷</strong>
          <p className="mt-3">지역과 대학, 사람의 목소리를 연결합니다.</p>
        </div>
        <div>
          <span className="subpage-footer-label">HARMONYNET NEWS</span>
          <p>대전광역시 등록 인터넷신문 · 하모니넷 편집국</p>
          <p className="mt-2">Copyright © Harmonynet. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
