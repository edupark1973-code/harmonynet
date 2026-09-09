import { NextResponse } from 'next/server';

const WP_API_BASE = process.env.NEXT_PUBLIC_WP_API_URL || 'https://huss.harmonynet.kr/wp-json/wp/v2';

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get('slug') || '';

  if (!/^[a-z0-9-]+$/i.test(slug)) {
    return NextResponse.json({ error: '올바르지 않은 페이지 주소입니다.' }, { status: 400 });
  }

  try {
    const response = await fetch(`${WP_API_BASE}/pages?slug=${encodeURIComponent(slug)}`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return NextResponse.json({ error: '페이지를 불러오지 못했습니다.' }, { status: response.status });
    }

    return NextResponse.json(await response.json(), {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '페이지 조회 오류';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
