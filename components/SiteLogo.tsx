import Image from 'next/image';
import Link from 'next/link';

export default function SiteLogo({ className = '' }: { className?: string }) {
  return (
    <Link href="/" className={`site-logo ${className}`} aria-label="하모니넷 홈">
      <Image
        src="/harmonynet-logo.png"
        alt="하모니넷"
        width={178}
        height={59}
        priority
        className="h-auto w-full"
      />
    </Link>
  );
}
