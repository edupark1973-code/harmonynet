import { NextResponse } from 'next/server';

const WP_API_BASE = process.env.NEXT_PUBLIC_WP_API_URL || 'https://huss.harmonynet.kr/wp-json/wp/v2';

const BROWSER_HEADERS: Record<string, string> = {
  'Accept': 'application/json, text/plain, */*',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Referer': 'https://harmonynet.kr',
  'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
  'Cache-Control': 'no-cache',
};

/**
 * Next.js API Route Proxy (/api/posts)
 * Cafe24 WAF / cupid.js 봇 방화벽 차단을 우회하기 위한 Server-side Proxy 엔드포인트
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const perPage = searchParams.get('per_page') || '13';
  const page = searchParams.get('page') || '1';
  const category = searchParams.get('category') || searchParams.get('categories') || '';
  const search = searchParams.get('search') || '';
  const id = searchParams.get('id') || '';
  const slug = searchParams.get('slug') || '';

  let targetUrl: string;

  if (id && /^\d+$/.test(id)) {
    // Cafe24 WAF가 `/posts/{id}?_embed` 단건 요청을 차단하는 경우가 있어
    // 동일한 결과를 반환하는 컬렉션의 include 쿼리를 사용한다.
    targetUrl = `${WP_API_BASE}/posts?_embed=1&include=${id}&per_page=1`;
  } else {
    targetUrl = `${WP_API_BASE}/posts?_embed=1&per_page=${perPage}&page=${page}`;
    if (category) targetUrl += `&categories=${encodeURIComponent(category)}`;
    if (search) targetUrl += `&search=${encodeURIComponent(search)}`;
    if (slug) targetUrl += `&slug=${encodeURIComponent(slug)}`;
  }

  try {
    const res = await fetch(targetUrl, {
      headers: BROWSER_HEADERS,
      next: { revalidate: 60 },
    });

    const contentType = res.headers.get('content-type') || '';

    if (!res.ok || !contentType.includes('application/json')) {
      const htmlText = await res.text();
      const titleMatch = htmlText.match(/<title>(.*?)<\/title>/i);
      const title = titleMatch ? titleMatch[1] : 'WAF Blocked Page';

      return NextResponse.json(
        {
          error: `Cafe24 WAF/Security Blocked (${res.status} ${res.statusText})`,
          details: title,
          targetUrl,
        },
        { status: res.status >= 400 ? res.status : 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Proxy fetch error';
    return NextResponse.json({ error: message, targetUrl }, { status: 500 });
  }
}
