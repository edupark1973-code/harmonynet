import Image from 'next/image';
import Link from 'next/link';
import { fetchPosts } from '@/lib/wp';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

const CATEGORY_NAMES: Record<string, string> = {
  region: '지역소식',
  startup: '창업·스타트업',
  opinion: '오피니언/칼럼',
  support: '정부지원사업',
  culture: '사회/문화',
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const categoryTitle = CATEGORY_NAMES[slug] || '카테고리 뉴스';

  const { posts, error } = await fetchPosts(12);

  return (
    <div className="min-h-screen bg-neutral-100 font-sans text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-100">
      {/* GNB / Header */}
      <header className="border-b border-neutral-300 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            하모니<span className="text-red-600">넷</span>
          </Link>
          <Link href="/" className="text-sm font-semibold text-red-600 hover:underline">
            ← 메인 홈으로 돌아가기
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 border-b-2 border-neutral-900 pb-3 dark:border-white">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {categoryTitle}
          </h1>
          <p className="mt-1 text-xs text-neutral-500">
            하모니넷 {categoryTitle} 분야의 최신 기사입니다.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
            API 알림: {error}
          </div>
        )}

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="group flex flex-col justify-between rounded-lg border border-neutral-200 bg-white p-4 transition shadow-sm hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div>
                  <div className="relative mb-3 aspect-[16/9] w-full overflow-hidden rounded bg-neutral-100 dark:bg-neutral-800">
                    <Image
                      src={post.imageUrl}
                      alt={post.imageAlt}
                      fill
                      unoptimized={post.imageUrl.startsWith('data:')}
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  <h2 className="mb-2 line-clamp-2 text-base font-bold text-neutral-900 group-hover:text-red-600 dark:text-neutral-100">
                    <Link href={`/posts/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h2>

                  <p className="mb-3 line-clamp-2 text-xs text-neutral-600 dark:text-neutral-400">
                    {post.excerpt}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-neutral-100 pt-2 text-[11px] text-neutral-500 dark:border-neutral-800">
                  <span>{post.authorName}</span>
                  <span>{post.formattedDate}</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-neutral-500">해당 카테고리에 기사가 없습니다.</div>
        )}
      </main>
    </div>
  );
}
