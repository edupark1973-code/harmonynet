import Image from 'next/image';

export default function SiteFooter() {
  return (
    <footer className="subpage-footer">
      <div className="subpage-shell footer-company-info">
        <div className="footer-logo-wrap">
          <Image src="/harmonynet-logo.png" alt="하모니넷" width={178} height={59} className="footer-logo" />
        </div>
        <div className="footer-info-lines">
          <p>제호: 하모니넷 <span>|</span> 등록번호: 대전아00430 <span>|</span> 등록일: 2022.07.29</p>
          <p>회사명: 하모니테라 <span>|</span> 사업자등록번호: 194-17-01786</p>
          <p>주소: 대전 유성구 원신흥남로12번길 41-29</p>
          <p>발행인: 지연이 <span>|</span> 편집인: 지연이 <span>|</span> 청소년보호책임자: 박정용</p>
          <p>문의: <a href="tel:0424895792">042-489-5792</a> <span>|</span> 이메일: <a href="mailto:edufiles@daum.net">edufiles@daum.net</a></p>
          <p className="footer-copyright">Copyright © 2026 하모니넷</p>
        </div>
      </div>
    </footer>
  );
}
