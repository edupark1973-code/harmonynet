import SiteFooter from '@/components/SiteFooter';
import { SectionHeader } from '@/components/SectionShell';

type Certificate = {
  title: string;
  name: string;
  registration: string;
  ministry: string;
  issuer: string;
};

const certificates: Certificate[] = [
  {
    title: '민간자격증 ① 창업교육전문가 1급',
    name: '창업교육전문가 1급',
    registration: '2026-000165',
    ministry: '중소벤처기업부',
    issuer: '미래지식융합협회 (공동운영기관: 창업교육협동조합)',
  },
  {
    title: '민간자격증 ② 스피치프레젠테이션 1급 · 2급',
    name: '스피치프레젠테이션 1급, 2급',
    registration: '2026-000166',
    ministry: '교육부',
    issuer: '미래지식융합협회 (공동운영기관: 한국콘텐츠기업협회)',
  },
];

function CertificateTable({ certificate }: { certificate: Certificate }) {
  return (
    <section className="mt-10">
      <h2 className="border-b-2 border-red-700 pb-3 text-xl font-bold text-neutral-900">{certificate.title}</h2>
      <dl className="mt-5 grid overflow-hidden border border-red-100 text-sm sm:grid-cols-[150px_1fr_150px_1fr]">
        <dt className="bg-red-50 p-4 font-bold text-red-700">자격명</dt><dd className="border-b border-red-100 p-4 sm:border-r">{certificate.name}</dd>
        <dt className="bg-red-50 p-4 font-bold text-red-700">자격의 종류</dt><dd className="border-b border-red-100 p-4">등록민간자격</dd>
        <dt className="bg-red-50 p-4 font-bold text-red-700">등록번호</dt><dd className="border-b border-red-100 p-4 sm:border-r">{certificate.registration}<br />주무부처: {certificate.ministry}</dd>
        <dt className="bg-red-50 p-4 font-bold text-red-700">자격발급기관</dt><dd className="border-b border-red-100 p-4">{certificate.issuer}</dd>
        <dt className="bg-red-50 p-4 font-bold text-red-700">총비용<br />(세부내역)</dt><dd className="border-b border-red-100 p-4 sm:border-r">총비용: 교육과정비 + 자격발급비<br />운영기관별 교육과정비는 교육비, 응시료 및 회원혜택 등을 모집 시 별도 공지합니다.<br />협회 자격발급비: 25,000원</dd>
        <dt className="bg-red-50 p-4 font-bold text-red-700">환불규정</dt><dd className="border-b border-red-100 p-4">응시료는 접수마감 전까지 100% 환불되며, 검정 당일 취소 시 30% 공제 후 환불됩니다.<br />자격발급비는 합격자에 한하며, 자격증 제작·발송 전 취소 시 100% 환불되고 이후에는 환급되지 않습니다.</dd>
      </dl>
    </section>
  );
}

export default function CertificationsPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] text-neutral-900">
      <SectionHeader />
      <main className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <p className="text-xs font-bold tracking-[.18em] text-red-700">PRIVATE QUALIFICATION</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">미래지식융합협회 민간자격증 정보공시</h1>
        <p className="mt-8 border-l-4 border-red-700 bg-white p-6 text-sm leading-7 text-neutral-700">미래지식융합협회는 창업·교육·콘텐츠 분야를 중심으로 미래 사회에 필요한 전문 인재를 양성하고, 실무 중심의 교육 콘텐츠 개발과 자격제도 운영을 통해 개인과 조직의 경쟁력 강화를 지원하는 비영리 단체입니다. 본 협회는 자격기본법에 따라 등록된 민간자격을 체계적으로 운영·관리하고 있습니다.</p>
        <section className="mt-12"><h2 className="border-b-2 border-red-700 pb-3 text-xl font-bold">협회 보유 민간자격증 안내</h2><p className="mt-5 text-sm leading-7 text-neutral-700">미래지식융합협회는 다음의 민간자격증을 운영하며, 각 자격의 상세 정보를 자격기본법에 따른 정보공시 기준에 맞추어 공개합니다.</p></section>
        {certificates.map((certificate) => <CertificateTable key={certificate.registration} certificate={certificate} />)}
        <section className="mt-10"><h2 className="border-b-2 border-red-700 pb-3 text-xl font-bold">자격관리·운영(발급)기관 정보</h2><dl className="mt-5 grid overflow-hidden border border-red-100 text-sm sm:grid-cols-[150px_1fr_150px_1fr]"><dt className="bg-red-50 p-4 font-bold text-red-700">기관명</dt><dd className="border-b border-red-100 p-4 sm:border-r">미래지식융합협회</dd><dt className="bg-red-50 p-4 font-bold text-red-700">대표자</dt><dd className="border-b border-red-100 p-4">박남구</dd><dt className="bg-red-50 p-4 font-bold text-red-700">연락처</dt><dd className="border-b border-red-100 p-4 sm:border-r">042-535-3455</dd><dt className="bg-red-50 p-4 font-bold text-red-700">이메일</dt><dd className="border-b border-red-100 p-4">edufiles@daum.net</dd><dt className="bg-red-50 p-4 font-bold text-red-700">소재지</dt><dd className="border-b border-red-100 p-4 sm:border-r">대전광역시 중구 센트리아오피스텔 3F</dd><dt className="bg-red-50 p-4 font-bold text-red-700">홈페이지</dt><dd className="border-b border-red-100 p-4">harmonynet.kr</dd></dl></section>
        <section className="mt-10 border-2 border-red-200 bg-red-50 p-6 text-sm leading-7"><h2 className="font-bold text-red-700">소비자 알림 사항</h2><p className="mt-3">① 상기 자격은 자격기본법 규정에 따라 등록한 민간자격으로, 국가로부터 인정받은 공인자격이 아닙니다.<br />② 민간자격 등록 및 공인 제도에 관한 상세 내용은 민간자격정보서비스(www.pqi.or.kr)의 ‘민간자격 소개’를 참고하십시오.</p></section>
      </main>
      <SiteFooter />
    </div>
  );
}
