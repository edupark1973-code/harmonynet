import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import SiteLogo from '@/components/SiteLogo';

export function SectionHeader() {
  return (
    <>
      <div className="subpage-topline">
        <div className="subpage-shell flex items-center justify-between">
          <span>HARMONYNET NEWS</span>
          <span>지역과 대학, 사람을 잇는 콘텐츠 미디어</span>
          <span suppressHydrationWarning>{new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }).format(new Date())}</span>
        </div>
      </div>
      <header className="subpage-header">
        <div className="subpage-shell flex items-center justify-between py-5 sm:py-7">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <SiteLogo className="w-[138px] shrink-0 sm:w-[178px]" />
            <span className="max-w-[150px] border-l border-neutral-300 pl-3 text-[10px] leading-snug text-neutral-500 sm:max-w-none sm:pl-4 sm:text-xs">
              대전·세종 로컬기업&amp;대학 뉴스
            </span>
          </div>
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
  return <SiteFooter />;
}
