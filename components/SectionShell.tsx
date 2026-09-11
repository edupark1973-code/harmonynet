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
          <SiteLogo className="w-[154px] sm:w-[178px]" />
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
