'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const MENU_ITEMS = [
  { label: '로컬소식', href: '/category/local' },
  { label: '대학소식', href: '/category/huss' },
  { label: '로컬기업소개', href: '/section/startup' },
  { label: '민간자격과정', href: '/certifications' },
];

function MenuLinks({ pathname, mobile = false }: { pathname: string; mobile?: boolean }) {
  return (
    <>
      <Link
        href="/"
        className={`${mobile ? 'block border-b px-4 py-3' : 'px-3.5 py-3'} ${pathname === '/' ? 'font-bold text-red-700' : 'hover:text-red-700'}`}
      >
        홈
      </Link>
      {MENU_ITEMS.map((item) => {
        const active = pathname.startsWith(item.href);
        const className = `${mobile ? 'block border-b px-4 py-3' : 'whitespace-nowrap px-3.5 py-3'} transition ${active ? 'font-bold text-red-700' : 'hover:text-red-700'}`;

        return <Link key={item.label} href={item.href} className={className}>{item.label}</Link>;
      })}
      <a
        href="http://huss.harmonynet.kr/wp-admin"
        target="_blank"
        rel="noreferrer"
        className={`${mobile ? 'block px-4 py-3' : 'ml-auto whitespace-nowrap px-3.5 py-3 text-xs'} font-semibold text-neutral-500 hover:text-red-700`}
      >
        로그인/기사작성 ↗
      </a>
    </>
  );
}

export default function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="border-t-2 border-red-700 border-b border-neutral-200 bg-white text-neutral-900 shadow-sm dark:border-red-600 dark:bg-neutral-900 dark:text-white">
      <div className="mx-auto flex max-w-7xl items-center overflow-x-auto px-4 text-[15px] font-semibold">
        <MenuLinks pathname={pathname} />
      </div>
    </nav>
  );
}
