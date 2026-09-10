import Image from 'next/image';

export default function SiteFooter() {
  return (
    <footer className="subpage-footer">
      <div className="subpage-shell footer-company-info">
        <div className="footer-logo-wrap">
          <Image src="/harmonynet-logo.png" alt="하모니넷" width={178} height={59} className="footer-logo" />
        </div>
        <div className="footer-info-lines">
          <p>제호: 하모니넷 <span>|</span> 등록번호: 대전 아00000 <span>|</span> 등록일: 2026년</p>
          <p>회사명: 하모니넷 <span>|</span> 대표자: 편집국</p>
          <p>문의: contact@harmonynet.kr</p>
          <p className="footer-copyright">Copyright © Harmonynet. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
