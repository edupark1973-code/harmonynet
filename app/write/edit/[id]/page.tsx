'use client';

import Link from 'next/link';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { FormEvent, use, useEffect, useRef, useState } from 'react';
import { getDb, getStorageClient } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';
import { SectionHeader } from '@/components/SectionShell';
import SiteFooter from '@/components/SiteFooter';

type EditPageProps = { params: Promise<{ id: string }> };

export default function EditArticlePage({ params }: EditPageProps) {
  const { id } = use(params);
  const { user, role, loading } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('local');
  const [status, setStatus] = useState<'draft' | 'pending' | 'published'>('published');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(getDb(), 'localPosts', id)).then((snapshot) => {
      const data = snapshot.data();
      if (!snapshot.exists() || !data || data.authorId !== user.uid || !['draft', 'pending', 'published'].includes(data.status)) {
        setMessage('수정할 수 없는 기사입니다.');
        return;
      }
      setTitle(data.title || '');
      setContent(data.content || '');
      setCategory(data.category || 'local');
      setStatus(data.status === 'draft' || data.status === 'published' ? data.status : 'pending');
      setImageUrls(Array.isArray(data.imageUrls)
        ? data.imageUrls.filter((url: unknown): url is string => typeof url === 'string' && Boolean(url))
        : typeof data.imageUrl === 'string' && data.imageUrl ? [data.imageUrl] : []);
      setReady(true);
    }).catch(() => setMessage('기사를 불러오지 못했습니다.'));
  }, [id, user]);

  function insertPhotoMarker(index: number) {
    const textarea = contentRef.current;
    const start = textarea?.selectionStart ?? content.length;
    const end = textarea?.selectionEnd ?? start;
    const marker = `[사진${index + 1}]`;
    setContent(`${content.slice(0, start)}${marker}${content.slice(end)}`);
    requestAnimationFrame(() => {
      textarea?.focus();
      textarea?.setSelectionRange(start + marker.length, start + marker.length);
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !ready || !title.trim() || !content.trim() || (!imageUrls.length && !imageFiles.length && category !== 'opinion')) {
      setMessage('제목, 대표이미지, 본문을 모두 입력해 주세요.');
      return;
    }
    const photoMarkers = [...content.matchAll(/\[사진(\d+)\]/g)].map((match) => Number(match[1]));
    if (photoMarkers.some((number) => number < 1 || number > imageUrls.length + imageFiles.length)) {
      setMessage('본문의 [사진1], [사진2] 마커와 선택한 사진 번호를 확인해 주세요.');
      return;
    }
    setSaving(true);
    try {
      const uploadedImageUrls = await Promise.all(imageFiles.map(async (imageFile, index) => {
        const imageRef = ref(getStorageClient(), `article-images/${user.uid}/${Date.now()}-${index}-${imageFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`);
        return getDownloadURL((await uploadBytes(imageRef, imageFile, { contentType: imageFile.type })).ref);
      }));
      const nextImageUrls = [...imageUrls, ...uploadedImageUrls];
      await updateDoc(doc(getDb(), 'localPosts', id), { title: title.trim(), content: content.trim(), category, status, imageUrl: nextImageUrls[0] || '', imageUrls: nextImageUrls, imageAlt: title.trim(), updatedAt: new Date().toISOString() });
      setImageUrls(nextImageUrls);
      setImageFiles([]);
      setMessage(status === 'draft' ? '임시저장되었습니다.' : status === 'published' ? '수정된 기사가 공개되었습니다.' : '수정되었습니다. 관리자 재승인 후 공개됩니다.');
    } catch (error) {
      console.error('Local article update error:', error);
      setMessage('수정하지 못했습니다.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-neutral-900 antialiased">
      <SectionHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-10">
        <p className="text-xs font-bold tracking-[0.2em] text-red-700">EDIT ARTICLE</p>
        <h1 className="mt-2 font-serif text-3xl font-extrabold">기사 수정</h1>
        {loading ? <div className="mt-8 h-32 animate-pulse rounded bg-neutral-200" /> : !user ? (
          <div className="mt-8 rounded-lg border border-neutral-200 bg-white p-6 text-sm">로그인이 필요합니다.</div>
        ) : !ready ? (
          <div className="mt-8 rounded-lg border border-neutral-200 bg-white p-6 text-sm text-red-700">{message || '기사를 불러오는 중입니다.'}</div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
            <label className="block"><span className="mb-2 block text-sm font-bold">제목</span><input value={title} onChange={(event) => setTitle(event.target.value)} className="w-full rounded border border-neutral-300 px-4 py-3 text-sm" /></label>
            <label className="block"><span className="mb-2 block text-sm font-bold">분야</span><select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded border border-neutral-300 px-4 py-3 text-sm"><option value="local">로컬소식</option><option value="huss">대학소식</option><option value="opinion">오피니언</option></select></label>
            <div>
              <span className="mb-2 block text-sm font-bold">사진</span>
              <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => { setImageFiles((previous) => [...previous, ...Array.from(event.currentTarget.files || [])]); event.currentTarget.value = ''; }} className="block w-full rounded border border-neutral-300 px-3 py-2 text-sm" />
              <p className="mt-1 text-xs text-neutral-500">새 사진을 추가하고, 본문에서 사진을 넣을 위치에 커서를 둔 뒤 ‘본문에 삽입’을 누르세요.</p>
              {imageUrls.length + imageFiles.length > 0 && <ul className="mt-3 space-y-2">
                {imageUrls.map((url, index) => <li key={`${url}-${index}`} className="flex flex-wrap items-center justify-between gap-2 rounded bg-neutral-50 px-3 py-2 text-sm"><span>사진 {index + 1}{index < imageUrls.length ? ' (기존)' : ''}</span><button type="button" onClick={() => insertPhotoMarker(index)} className="font-semibold text-red-700 hover:underline">본문에 삽입 [사진{index + 1}]</button></li>)}
                {imageFiles.map((imageFile, index) => { const photoIndex = imageUrls.length + index; return <li key={`${imageFile.name}-${imageFile.lastModified}`} className="flex flex-wrap items-center justify-between gap-2 rounded bg-neutral-50 px-3 py-2 text-sm"><span>사진 {photoIndex + 1}: {imageFile.name}</span><button type="button" onClick={() => insertPhotoMarker(photoIndex)} className="font-semibold text-red-700 hover:underline">본문에 삽입 [사진{photoIndex + 1}]</button></li>; })}
              </ul>}
            </div>
            <label className="block"><span className="mb-2 block text-sm font-bold">본문</span><textarea ref={contentRef} value={content} onChange={(event) => setContent(event.target.value)} className="min-h-80 w-full rounded border border-neutral-300 px-4 py-3 text-sm leading-7" placeholder="사진을 넣으려면 [사진1] 같은 마커를 사용하세요." /></label>
            <div className="flex flex-wrap gap-3"><select value={status} onChange={(event) => setStatus(event.target.value as 'draft' | 'pending' | 'published')} className="rounded border border-neutral-300 px-3 py-2 text-sm">{(role === 'writer' || role === 'admin') && <option value="published">바로 공개</option>}<option value="pending">수정 후 재검토 요청</option><option value="draft">임시저장</option></select><button disabled={saving} className="rounded bg-red-700 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">{saving ? '저장 중...' : '수정 저장'}</button></div>
            {message && <p className="text-sm text-red-700">{message}</p>}
          </form>
        )}
        <Link href="/write/my" className="mt-6 inline-block text-sm font-semibold text-neutral-500 hover:text-red-700">← 내 기사로 돌아가기</Link>
      </main>
      <SiteFooter />
    </div>
  );
}
