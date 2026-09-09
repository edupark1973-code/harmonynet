# 하모니넷 (Harmonynet) 제품 요구사항 정의서 (PRD)

---

## 1. 프로젝트 개요 및 목표 (Project Overview)

본 프로젝트는 대전·충청 지역 창업 생태계 뉴스 및 인터넷 신문 서비스를 제공하는 **하모니넷(Harmonynet)**의 기존 카페24 워드프레스 웹사이트를 **헤드리스 워드프레스(Headless WordPress)** 아키텍처로 전환하는 프로젝트입니다.

* **프로젝트명**: 하모니넷 (인터넷 신문) 프론트엔드 리뉴얼 및 헤드리스 마이그레이션
* **백엔드 (CMS)**: 기존 카페24 워드프레스 유지 및 REST API (`https://huss.harmonynet.kr/wp-json/wp/v2/`) 연동
* **프론트엔드**: Next.js (App Router), Tailwind CSS
* **인프라 및 배포**: 파이어베이스(Firebase) App Hosting (SSR 지원)
* **핵심 목표**: 
  1. 해외 매거진 스타일을 지양하고, **한국형 네이버 뉴스 스탠드 스타일**의 높은 정보 밀도와 직관적인 기사 배치 구현.
  2. 기존 워드프레스의 느린 속도를 개선하여 초고속 초기 로딩(SSR/ISR) 및 이미지 최적화 달성.
  3. 모바일/데스크톱 완벽 반응형 구현 및 강력한 동적 SEO 지원.

---

## 2. 주요 대상 및 페르소나 (Target Audience & Personas)

| 페르소나 | 주요 특징 | 주요 요구사항 및 행동 패턴 |
| :--- | :--- | :--- |
| **페르소나 A (지역 창업가/독자)** | 대전·충청 지역 스타트업 대표 및 지원 사업 관심자 | 바쁜 일정 속에서 최 최신 창업 지원 공고 및 생태계 소식을 한눈에 파악하고자 함. |
| **페르소나 B (시사/뉴스 일반 독자)** | 지역 사회 주요 뉴스 및 오피니언 칼럼 독자 | 텍스트 중심의 정돈된 리스트를 통해 빠르게 헤드라인과 주요 기사를 스캔하고 읽기를 원함. |
| **페르소나 C (기자/에디터)** | 하모니넷 기자단 및 기고 칼럼니스트 | 워드프레스 어드민에서 기사 작성 후, 프론트엔드 서비스에 실시간/빠르게 반영되기를 기대함. |

---

## 3. 기능 요구사항 (Functional Requirements)

| 기능 ID | 구분 / 모듈 | 기능명 | 세부 설명 및 요구사항 | 우선순위 |
| :--- | :--- | :--- | :--- | :--- |
| **FR-01** | **GNB** | 상단 브랜드 로고 및 홈 이동 | 클릭 시 메인 페이지(`/`)로 이동하는 브랜드 로고 배치 | **P0** |
| **FR-02** | **GNB** | 동적 카테고리 네비게이션 | 워드프레스 Categories API 연동 또는 지정 카테고리 목록(지역소식, 창업/스타트업, 오피니언 등) 네비게이션 메뉴 구성 | **P0** |
| **FR-03** | **GNB** | 모바일 네비게이션 (햄버거) | 모바일 해상도에서 드로어(Drawer) 또는 햄버거 메뉴를 통한 카테고리 이동 기능 제공 | **P0** |
| **FR-04** | **메인** | 최상단 헤드라인 뉴스 블록 | 메인 페이지 상단에 주요 헤드라인 기사 1~3건을 뉴스 스탠드 포맷으로 강렬하게 노출 | **P0** |
| **FR-05** | **메인** | 고밀도 텍스트 중심 기사 리스트 | 네이버 뉴스 스탠드 스타일로 여백을 최소화하고 카테고리별 최신 기사를 텍스트/미니 썸네일 조합으로 높은 밀도로 배치 | **P0** |
| **FR-06** | **메인** | 기사 요약 및 썸네일 노출 | 각 기사 카드는 썸네일, 제목, 발행일자, 1~2줄 요약(excerpt)으로 구성 | **P1** |
| **FR-07** | **상세** | 기사 본문 상세 렌더링 | 워드프레스 REST API (`/posts/{id}`) 연동. 제목, 작성일, 카테고리, 대표 이미지, 본문 HTML 안전하게 렌더링 | **P0** |
| **FR-08** | **상세** | 본문 타이포그래피 최적화 | Tailwind Typography (`prose`) 적용으로 본문 폰트 크기, 줄간격, 이미지 가독성 극대화 | **P0** |
| **FR-09** | **상세** | 이전 / 다음 기사 네비게이션 | 기사 하단에 해당 카테고리의 이전 기사 및 다음 기사 이동 링크 제공 | **P1** |
| **FR-10** | **상세** | 연관 기사 & 인기 기사 사이드바 | 데스크톱 우측 사이드바 및 모바일 하단에 동일 카테고리 연관 기사 및 많이 본 인기 기사 배치 | **P1** |
| **FR-11** | **검색** | 키워드 검색바 | GNB 또는 메인 상단에 검색 키워드 입력 창 제공 | **P1** |
| **FR-12** | **검색** | 검색 결과 페이지 (`/search`) | 워드프레스 API (`/wp-json/wp/v2/posts?search={query}`)를 통한 검색 결과 기사 리스트 렌더링 | **P1** |

*우선순위: P0 (필수 / Launch Blocker), P1 (중요), P2 (권장)*

---

## 4. 비기능 요구사항 (Non-Functional Requirements)

### 4.1 성능 (Performance)
* **초기 로딩 속도 (SSR / ISR)**: 
  * Next.js App Router의 Server Side Rendering(SSR) 및 Incremental Static Regeneration(ISR)을 활용하여 First Contentful Paint(FCP) 1.2초 이내 달성.
* **이미지 최적화 (`next/image`)**:
  * 워드프레스 미디어 이미지를 `next/image` 컴포넌트로 자동 Resizing, WebP/AVIF 전환 및 Lazy Loading 적용. LCP(Largest Contentful Paint) 최적화.

### 4.2 SEO (검색엔진 최적화)
* **동적 메타 태그 (Dynamic Metadata)**:
  * Next.js `generateMetadata` 함수를 사용해 기사 상세 페이지별 제목(`title`), 설명(`description`), 카테고리, 발행일 동적 생성.
* **소셜 셰어 메타 (Open Graph & Twitter Card)**:
  * og:title, og:image, og:description 태그를 기사 대표 썸네일 및 내용과 연동하여 카카오톡, 페이스북 공유 시 뉴스 카드로 올바르게 출력.
* **시맨틱 태그 및 구조화 데이터**:
  * `<header>`, `<main>`, `<article>`, `<aside>`, `<footer>` 시맨틱 HTML 적용 및 뉴스 기사 구조화 데이터(JSON-LD) 삽입.

### 4.3 반응형 웹 (Responsive Web Design)
* **다양한 해상도 완벽 대응**:
  * Mobile (< 640px), Tablet (640px ~ 1024px), PC (> 1024px)에 반응하는 레이아웃 구현.
  * 데스크톱의 다단(Multi-column) 뉴스 스탠드 배치가 모바일 환경에서는 가독성 높은 1열 고밀도 리스트 뷰로 자동 전환.

---

## 5. 제약 사항 및 예외 처리 (Constraints & Exception Handling)

1. **대표 썸네일 이미지 부재 처리 (Fallback Image)**:
   * 워드프레스 기사에 `featured_media` 또는 대표 이미지가 없는 경우, 기본 지정된 하모니넷 브랜딩 Placeholder 이미지(`public/placeholder-news.png`)로 자동 대체.
2. **워드프레스 REST API 응답 실패 / 지연 처리**:
   * API 서버 응답 오류(5xx) 또는 네트워크 지연 시 Next.js `error.tsx` 및 `loading.tsx` 스켈레톤 UI를 제공하여 사용자 경험 저해 방지.
3. **본문 HTML XSS 방지 및 스타일링**:
   * 워드프레스 에디터에서 전달되는 본문 HTML Content는 정제된 태그만 렌더링하고, Tailwind CSS `@tailwindcss/typography` (`prose` 클래스)로 일관된 포맷 유지.
4. **외부 이미지 도메인 승인 (Next.config)**:
   * 카페24 워드프레스 media 서버 및 `harmonynet.kr` 이미지 도메인을 `next.config.ts`의 `images.remotePatterns`에 사전 등록 필수.
