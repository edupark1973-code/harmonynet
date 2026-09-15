'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

const MENU_ITEMS = [
  { label: '로컬소식', href: '/category/local' },
  { label: '대학소식', href: '/category/huss' },
  { label: '오피니언', href: '/category/opinion' },
  { label: '로컬기업소개', href: '/section/startup' },
  { label: '기프트릿', href: 'https://gift.harmonynet.kr/', external: true },
  { label: 'EduFiles', href: 'https://jyp-mentor.web.app/', external: true },
  { label: '민간자격과정', href: '/certifications' },
];

function MenuLinks({ pathname, mobile = false }: { pathname: string; mobile?: boolean }) {
  const { user, role, signOutUser } = useAuth();
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

        return item.external ? <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className={className}>{item.label}</a> : <Link key={item.label} href={item.href} className={className}>{item.label}</Link>;
      })}
      <Link href="/write" className={`${mobile ? 'block px-4 py-3' : 'ml-auto whitespace-nowrap px-3.5 py-3 text-xs'} font-semibold text-neutral-500 hover:text-red-700`}>
        {user ? '기사 작성' : '로그인/기사 작성'}
      </Link>
      {user && <Link href="/write/my" className={`${mobile ? 'block px-4 py-3' : 'whitespace-nowrap px-3.5 py-3 text-xs'} font-semibold text-neutral-500 hover:text-red-700`}>내 기사</Link>}
      {role === 'admin' && <Link href="/admin/articles" className={`${mobile ? 'block px-4 py-3' : 'whitespace-nowrap px-3.5 py-3 text-xs'} font-bold text-red-700 hover:text-red-800`}>기사 관리</Link>}
      {role === 'admin' && <Link href="/admin/users" className={`${mobile ? 'block px-4 py-3' : 'whitespace-nowrap px-3.5 py-3 text-xs'} font-bold text-red-700 hover:text-red-800`}>사용자 관리</Link>}
      {user && <button type="button" onClick={() => signOutUser()} className={`${mobile ? 'block px-4 py-3 text-left' : 'whitespace-nowrap px-3.5 py-3 text-xs'} font-semibold text-neutral-500 hover:text-red-700`}>로그아웃</button>}
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
