import { WPPost, NormalizedPost, WPCategory } from '@/types/post';

const DEFAULT_WP_API = 'https://huss.harmonynet.kr/wp-json/wp/v2';
export const WP_API_BASE = (process.env.NEXT_PUBLIC_WP_API_URL || DEFAULT_WP_API).replace(/\/+$/, '');
export const DEFAULT_FALLBACK_IMAGE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="%23f3f4f6"><rect width="100%" height="100%" fill="%23e5e7eb"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" font-weight="600" fill="%236b7280">하모니넷 HARMONYNET</text></svg>';

const HTML_ENTITIES: Record<string, string> = {
  amp: '&',
  apos: "'",
  gt: '>',
  hellip: '…',
  laquo: '«',
  ldquo: '“',
  lsquo: '‘',
  lt: '<',
  nbsp: ' ',
  quot: '"',
  raquo: '»',
  rdquo: '”',
  rsquo: '’',
};

function decodeHtmlEntities(value: string): string {
  // WordPress 콘텐츠에는 `&amp;#8216;`처럼 이중 인코딩된 값도 있어
  // 한 번 더 디코딩하되 무한 반복은 피한다.
  let decoded = value;

  for (let pass = 0; pass < 2; pass += 1) {
    const next = decoded.replace(/&(#(?:x[0-9a-f]+|\d+)|[a-z]+);/gi, (entity, code: string) => {
      if (code[0] !== '#') return HTML_ENTITIES[code.toLowerCase()] ?? entity;

      const hexadecimal = code[1]?.toLowerCase() === 'x';
      const codePoint = Number.parseInt(code.slice(hexadecimal ? 2 : 1), hexadecimal ? 16 : 10);

      if (!Number.isFinite(codePoint) || codePoint < 0 || codePoint > 0x10ffff) return entity;

      try {
        return String.fromCodePoint(codePoint);
      } catch {
        return entity;
      }
    });

    if (next === decoded) break;
    decoded = next;
  }

  return decoded;
}

function useHttps(url: string): string {
  return url.replace(/^http:\/\/(?:www\.)?huss\.harmonynet\.kr/i, 'https://huss.harmonynet.kr');
}

function getFirstContentImage(html: string): string | undefined {
  if (!html) return undefined;

  const imageTag = html.match(/<img\b[^>]*>/i)?.[0];
  if (!imageTag) return undefined;

  const source =
    imageTag.match(/\sdata-src=(['"])(.*?)\1/i)?.[2] ||
    imageTag.match(/\ssrc=(['"])(.*?)\1/i)?.[2];

  return source ? useHttps(decodeHtmlEntities(source)) : undefined;
}

/**
 * WordPress 이미지 최적화 플러그인(Smush 등)은 실제 주소를 data-src에
 * 보관하고 src에는 투명 placeholder를 넣는다. 외부 사이트에서는 해당
 * 플러그인의 스크립트가 실행되지 않으므로 표준 이미지 속성으로 복원한다.
 */
function normalizeContentImages(html: string): string {
  return html.replace(/<img\b[^>]*>/gi, (imageTag) => {
    const lazySrc = imageTag.match(/\sdata-src=(['"])(.*?)\1/i)?.[2];
    const lazySrcset = imageTag.match(/\sdata-srcset=(['"])(.*?)\1/i)?.[2];
    const lazySizes = imageTag.match(/\sdata-sizes=(['"])(.*?)\1/i)?.[2];

    let normalized = imageTag
      .replace(/\sdata-src=(['"])(.*?)\1/gi, '')
      .replace(/\sdata-srcset=(['"])(.*?)\1/gi, '')
      .replace(/\sdata-sizes=(['"])(.*?)\1/gi, '')
      .replace(/\sclass=(['"])(.*?)\1/i, (_match, quote: string, classes: string) => {
        const className = classes.split(/\s+/).filter((name: string) => name && name !== 'lazyload').join(' ');
        return className ? ` class=${quote}${className}${quote}` : '';
      });

    if (lazySrc) {
      const source = useHttps(lazySrc);
      normalized = /\ssrc=(['"])(.*?)\1/i.test(normalized)
        ? normalized.replace(/\ssrc=(['"])(.*?)\1/i, ` src="${source}"`)
        : normalized.replace(/<img/i, `<img src="${source}"`);
    } else {
      normalized = normalized.replace(/\ssrc=(['"])(.*?)\1/i, (_match, _quote, source: string) => ` src="${useHttps(source)}"`);
    }

    if (lazySrcset) {
      const srcset = lazySrcset.replace(/http:\/\/(?:www\.)?huss\.harmonynet\.kr/gi, 'https://huss.harmonynet.kr');
      normalized = /\ssrcset=(['"])(.*?)\1/i.test(normalized)
        ? normalized.replace(/\ssrcset=(['"])(.*?)\1/i, ` srcset="${srcset}"`)
        : normalized.replace(/<img/i, `<img srcset="${srcset}"`);
    }

    if (lazySizes && !/\ssizes=(['"])(.*?)\1/i.test(normalized)) {
      normalized = normalized.replace(/<img/i, `<img sizes="${lazySizes}"`);
    }

    return normalized;
  });
}

export function stripHtml(htmlString: string): string {
  if (!htmlString) return '';
  return decodeHtmlEntities(htmlString.replace(/<[^>]*>?/gm, '')).trim();
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

export function normalizePost(
  post: WPPost,
  fallbackImage: string = DEFAULT_FALLBACK_IMAGE
): NormalizedPost {
  const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0];
  const contentImage = getFirstContentImage(post.content?.rendered || '');
  const imageUrl =
    featuredMedia?.media_details?.sizes?.medium_large?.source_url ||
    featuredMedia?.media_details?.sizes?.large?.source_url ||
    featuredMedia?.source_url ||
    contentImage ||
    fallbackImage;

  const imageAlt = featuredMedia?.alt_text || stripHtml(post.title?.rendered || '') || '하모니넷 기사';

  const authorObj = post._embedded?.['author']?.[0];
  const authorName = authorObj?.name || '하모니넷 편집국';

  const categoriesList = post._embedded?.['wp:term']?.[0] || [];
  const primaryCategory = categoriesList.find((term) => term.taxonomy === 'category');
  const categoryName = primaryCategory?.name || '지역소식';
  const categoryId = primaryCategory?.id || (post.categories?.[0] ?? null);
  const categorySlug = primaryCategory?.slug || 'news';

  return {
    id: post.id,
    slug: post.slug || String(post.id),
    title: stripHtml(post.title?.rendered || '제목 없음'),
    excerpt: stripHtml(post.excerpt?.rendered || ''),
    content: normalizeContentImages(post.content?.rendered || ''),
    date: post.date,
    formattedDate: formatDate(post.date),
    imageUrl,
    imageAlt,
    authorName,
    categoryName,
    categoryId,
    categorySlug,
  };
}

/**
 * Cafe24 웹 방화벽(WAF) 및 봇 차단(cupid.js, Challenge 페이지) 우회를 위한 표준 브라우저 요청 헤더
 */
const BROWSER_HEADERS: Record<string, string> = {
  'Accept': 'application/json, text/plain, */*',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Referer': 'https://harmonynet.kr',
  'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
  'Cache-Control': 'no-cache',
};

/**
 * 워드프레스 REST API 공통 호출 함수 (Cafe24 WAF 우회 헤더 및 JSON 예외 처리)
 * 
 * [카페24 방화벽 및 보안 플러그인 점검 안내]
 * 1. 카페24 웹방화벽(WAF) 설정 중 '해외 IP 차단', '봇/스파이더 접근 차단', 'cupid.js 챌린지'가 활성화된 경우
 *    클라우드 호스팅(Firebase App Hosting/Cloud Run 리전: asia-east1 등)의 API 요청이 HTML 챌린지 페이지로 응답될 수 있습니다.
 * 2. 해결 방안:
 *    - 카페24 관리자 페이지 -> [웹방화벽/보안 설정]에서 REST API 경로(`/wp-json/*`)의 WAF 예외 처리 설정.
 *    - 워드프레스 어드민 보안 플러그인(Wordfence, iThemes Security 등)에서 REST API 인증/비인증 접근을 차단하고 있는지 확인.
 */
async function fetchWpApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${WP_API_BASE}${cleanEndpoint}`;

  const headers = {
    ...BROWSER_HEADERS,
    ...(options.headers || {}),
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = res.headers.get('content-type') || '';

  if (!res.ok) {
    let errorDetail = `HTTP ${res.status} ${res.statusText}`;
    if (contentType.includes('text/html')) {
      const htmlText = await res.text();
      const titleMatch = htmlText.match(/<title>(.*?)<\/title>/i);
      errorDetail += ` (HTML Response: ${titleMatch ? titleMatch[1] : 'Non-JSON page returned'})`;
    }
    throw new Error(`[WP API Error] ${errorDetail} - Target URL: ${url}`);
  }

  if (!contentType.includes('application/json')) {
    const rawText = await res.text();
    const snippet = rawText.substring(0, 100).replace(/\s+/g, ' ');
    throw new Error(`[WP API Non-JSON / Cafe24 WAF] Target URL (${url}) returned Content-Type "${contentType}" instead of JSON. Cafe24 bot block or cupid.js challenge page suspected. Snippet: "${snippet}"`);
  }

  return await res.json();
}

/**
 * 최신 기사 목록 페치
 */
export async function fetchPosts(perPage = 13): Promise<{ posts: NormalizedPost[]; error?: string }> {
  try {
    const data = await fetchWpApi<WPPost[]>(`/posts?_embed&per_page=${perPage}`, {
      next: { revalidate: 60 },
    });

    if (!Array.isArray(data)) {
      throw new Error('WP API result is not an array.');
    }

    return { posts: data.map((post) => normalizePost(post)) };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Failed to fetch posts from Harmonynet WP API:', message);
    return { posts: [], error: message };
  }
}

/**
 * 카테고리 목록 페치
 */
export async function fetchCategories(): Promise<WPCategory[]> {
  try {
    return await fetchWpApi<WPCategory[]>('/categories?per_page=20', {
      next: { revalidate: 300 },
    });
  } catch (err) {
    console.error('Failed to fetch categories:', err);
    return [];
  }
}
