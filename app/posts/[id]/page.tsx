import type { Metadata } from 'next';
import PostDetailClient from './PostDetailClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://harmonynet.kr';
const DEFAULT_TITLE = '하모니넷 기사';
const DEFAULT_DESCRIPTION = '대전·세종 지역 소식을 전하는 하모니넷입니다.';
const DEFAULT_IMAGE = `${SITE_URL}/harmonynet-logo.png`;

type PostPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function imageUrl(value: string | undefined) {
  if (!value) return DEFAULT_IMAGE;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : DEFAULT_IMAGE;
  } catch {
    return DEFAULT_IMAGE;
  }
}

export async function generateMetadata({ params, searchParams }: PostPageProps): Promise<Metadata> {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const queryTitle = firstValue(query.title);
  const queryThumbnail = firstValue(query.thumb);
  const title = queryTitle?.trim() || DEFAULT_TITLE;
  const image = imageUrl(queryThumbnail);
  const canonicalUrl = `${SITE_URL}/posts/${encodeURIComponent(id)}`;
  const shareUrl = new URL(canonicalUrl);

  if (queryTitle) shareUrl.searchParams.set('title', title);
  if (queryThumbnail) shareUrl.searchParams.set('thumb', image);

  return {
    title,
    description: DEFAULT_DESCRIPTION,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: 'article', url: shareUrl.toString(), title, description: DEFAULT_DESCRIPTION,
      siteName: '하모니넷', locale: 'ko_KR', images: [{ url: image, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description: DEFAULT_DESCRIPTION, images: [image] },
  };
}

export default function PostPage({ params }: PostPageProps) {
  return <PostDetailClient params={params} />;
}
