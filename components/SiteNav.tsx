'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const MENU_ITEMS = [
  { label: '로컬소식', href: '/category/local' },
  { label: '대학소식', href: '/category/huss' },
  { label: '로컬기업소개', href: '/section/startup' },
  { label: '민간자격과정', href: 'https://huss.harmonynet.kr/fkca/', external: true },
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
        const active = !item.external && pathname.startsWith(item.href);
        const className = `${mobile ? 'block border-b px-4 py-3' : 'whitespace-nowrap px-3.5 py-3'} transition ${active ? 'font-bold text-red-700' : 'hover:text-red-700'}`;

        return item.external ? (
          <a key={item.label} href={item.href} className={className} target="_blank" rel="noreferrer">
            {item.label}<span className="ml-1 text-[9px] text-neutral-400">↗</span>
          </a>
        ) : (
          <Link key={item.label} href={item.href} className={className}>
            {item.label}
          </Link>
        );
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
      <div className="mx-auto hidden max-w-7xl items-center px-4 text-[15px] font-semibold lg:flex">
        <MenuLinks pathname={pathname} />
      </div>
      <details className="group mx-auto max-w-7xl lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-bold">
          <span>전체 메뉴</span>
          <span className="text-red-700 transition group-open:rotate-180">▼</span>
        </summary>
        <div className="border-t border-neutral-200 bg-white text-sm dark:border-neutral-800 dark:bg-neutral-900">
          <MenuLinks pathname={pathname} mobile />
        </div>
      </details>
    </nav>
  );
}
