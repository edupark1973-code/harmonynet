'use client';

import Script from 'next/script';
import { useCallback, useState } from 'react';

const KAKAO_JAVASCRIPT_KEY = '359d365a3841c3b538a428f8236aab92';
const KAKAO_SDK_URL = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js';

type KakaoSdk = {
  isInitialized: () => boolean;
  init: (key: string) => void;
  Share: { sendDefault: (settings: {
    objectType: 'feed';
    content: { title: string; description: string; imageUrl: string; link: ShareLink };
    buttons: Array<{ title: string; link: ShareLink }>;
  }) => void };
};
type ShareLink = { mobileWebUrl: string; webUrl: string };

declare global {
  interface Window { Kakao?: KakaoSdk }
}

interface ArticleShareButtonsProps { title: string; thumbnailUrl: string; description?: string }

function initializeKakao() {
  if (window.Kakao && !window.Kakao.isInitialized()) window.Kakao.init(KAKAO_JAVASCRIPT_KEY);
}

function buildShareUrl(title: string, thumbnailUrl: string) {
  const url = new URL(window.location.href);
  url.searchParams.set('title', title);
  url.searchParams.set('thumb', thumbnailUrl);
  return url.toString();
}

export default function ArticleShareButtons({ title, thumbnailUrl, description = '' }: ArticleShareButtonsProps) {
  const [copyLabel, setCopyLabel] = useState('링크 복사');
  const [sdkReady, setSdkReady] = useState(false);
  const handleSdkReady = useCallback(() => { initializeKakao(); setSdkReady(true); }, []);

  const handleKakaoShare = () => {
    initializeKakao();
    if (!window.Kakao?.isInitialized()) {
      window.alert('카카오톡 공유 기능을 불러오는 중입니다. 잠시 후 다시 시도해 주세요.');
      return;
    }
    const shareUrl = buildShareUrl(title, thumbnailUrl);
    const link = { mobileWebUrl: shareUrl, webUrl: shareUrl };
    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: { title, description: description.slice(0, 200), imageUrl: thumbnailUrl, link },
      buttons: [{ title: '기사 보기', link }],
    });
  };

  const handleCopy = async () => {
    const shareUrl = buildShareUrl(title, thumbnailUrl);
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyLabel('복사 완료');
      window.setTimeout(() => setCopyLabel('링크 복사'), 2000);
    } catch {
      window.prompt('아래 주소를 복사해 주세요.', shareUrl);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Script id="kakao-javascript-sdk" src={KAKAO_SDK_URL} strategy="afterInteractive"
        onLoad={handleSdkReady} onReady={handleSdkReady} onError={() => setSdkReady(false)} />
      <button type="button" onClick={handleKakaoShare}
        aria-label={sdkReady ? '카카오톡으로 기사 공유' : '카카오톡 공유 기능 불러오는 중'}
        className="rounded bg-[#FEE500] px-3 py-1.5 font-bold text-[#191919] hover:bg-[#f5dc00]">
        카카오톡 공유
      </button>
      <button type="button" onClick={handleCopy}
        className="rounded border border-neutral-300 bg-white px-3 py-1.5 font-bold text-neutral-700 hover:border-red-700 hover:text-red-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200">
        {copyLabel}
      </button>
    </div>
  );
}
