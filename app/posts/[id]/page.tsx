'use client';

import { useEffect, useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { WPPost, NormalizedPost } from '@/types/post';
import { normalizePost } from '@/lib/wp';

interface PostPageProps {
  params: Promise<{ id: string }>;
}

const WP_DIRECT_URL = 'https://huss.harmonynet.kr/wp-json/wp/v2/posts?_embed&per_page=15';

export default function PostPage({ params }: PostPageProps) {
  const resolvedParams = use(params);
  const postIdOrSlug = resolvedParams.id;

  const [post, setPost] = useState<NormalizedPost | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadPost() {
      try {
        setLoading(true);
        const res = await fetch(WP_DIRECT_URL, {
          headers: { 'Accept': 'application/json, text/plain, */*' },
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data: WPPost[] = await res.json();
        const normalized = data.map((p) => normalizePost(p));
        const matched = normalized.find((p) => String(p.id) === postIdOrSlug || p.slug === postIdOrSlug) || normalized[0];
        if (isMounted) {
          setPost(matched || null);
        }
      } catch (err) {
        console.error('Post detail fetch error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadPost();
    return () => {
      isMounted = false;
    };
  }, [postIdOrSlug]);

  return (
    <div className="min-h-screen bg-neutral-100 font-sans text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-100">
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

      <main className="mx-auto max-w-4xl px-4 py-8">
        {loading ? (
          <div className="h-96 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800"></div>
        ) : post ? (
          <article className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-4">
              <span className="inline-block rounded bg-red-600 px-2.5 py-1 text-xs font-bold text-white">
                {post.categoryName}
              </span>
              <h1 className="mt-3 text-2xl font-bold text-neutral-900 dark:text-white md:text-3xl">
                {post.title}
              </h1>
              <div className="mt-3 flex items-center gap-4 border-b border-neutral-200 pb-4 text-xs text-neutral-500 dark:border-neutral-800">
                <span>작성자: {post.authorName}</span>
                <span>•</span>
                <span>발행일: {post.formattedDate}</span>
              </div>
            </div>

            {post.imageUrl && (
              <div className="relative mb-6 aspect-[16/9] w-full overflow-hidden rounded bg-neutral-100 dark:bg-neutral-800">
                <Image
                  src={post.imageUrl}
                  alt={post.imageAlt}
                  fill
                  unoptimized={post.imageUrl.startsWith('data:')}
                  className="object-cover"
                />
              </div>
            )}

            <div
              className="prose prose-zinc max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-blue-600"
              dangerouslySetInnerHTML={{ __html: post.content || post.excerpt }}
            />
          </article>
        ) : (
          <div className="py-12 text-center text-neutral-500">기사를 찾을 수 없습니다.</div>
        )}
      </main>
    </div>
  );
}
