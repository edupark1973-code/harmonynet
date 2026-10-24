'use client';

import Link from 'next/link';
import Image from 'next/image';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { getDb, getStorageClient } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';
import { SectionHeader } from '@/components/SectionShell';
import SiteFooter from '@/components/SiteFooter';

const TRANSPARENT_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

export default function WritePage() {
  const { user, role, loading, firebaseConfigured, signIn, signOutUser } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('local');
  const [status, setStatus] = useState<'draft' | 'pending' | 'published'>('pending');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setStatus(role === 'writer' || role === 'admin' ? 'published' : 'pending');
  }, [role]);

  useEffect(() => {
    const previewUrls = imageFiles.map((file) => URL.createObjectURL(file));
    setPhotoPreviewUrls(previewUrls);
    return () => previewUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [imageFiles]);

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

  function removePhoto(index: number) {
    setImageFiles((previous) => previous.filter((_, photoIndex) => photoIndex !== index));
    setContent((previous) => previous.replace(/\[사진(\d+)\]/g, (marker, number: string) => {
      const markerIndex = Number(number) - 1;
      if (markerIndex === index) return '';
      return markerIndex > index ? `[사진${markerIndex}]` : marker;
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    if (!title.trim() || !content.trim()) {
      setMessage('제목과 본문을 입력해 주세요.');
      return;
    }
    if (!imageFiles.length && category !== 'opinion') {
      setMessage('사진을 한 장 이상 첨부해 주세요. 첫 사진이 대표 썸네일로 사용됩니다.');
      return;
    }

    const photoMarkers = [...content.matchAll(/\[사진(\d+)\]/g)].map((match) => Number(match[1]));
    if (photoMarkers.some((number) => number < 1 || number > imageFiles.length)) {
      setMessage('본문의 [사진1], [사진2] 마커와 선택한 사진 번호를 확인해 주세요.');
      return;
    }

    setSaving(true);
    setMessage('');
    try {
      const imageUrls = await Promise.all(imageFiles.map(async (imageFile, index) => {
        const imageRef = ref(getStorageClient(), `article-images/${user.uid}/${Date.now()}-${index}-${imageFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`);
        const uploaded = await uploadBytes(imageRef, imageFile, { contentType: imageFile.type });
        return getDownloadURL(uploaded.ref);
      }));

      await addDoc(collection(getDb(), 'localPosts'), {
        title: title.trim(),
        content: content.trim(),
        category,
        status,
        authorId: user.uid,
        authorName: user.displayName || '하모니넷 작성자',
        authorEmail: user.email || '',
        imageUrl: imageUrls[0] || '',
        imageUrls,
        imageAlt: title.trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setTitle('');
      setContent('');
      setImageFiles([]);
      setMessage(status === 'draft' ? '임시저장되었습니다.' : status === 'published' ? '기사가 공개되었습니다.' : '검토 요청이 접수되었습니다. 관리자 승인 후 공개됩니다.');
    } catch (error) {
      console.error('Local article save error:', error);
      setMessage('저장하지 못했습니다. Firebase 설정과 권한을 확인해 주세요.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-neutral-900 antialiased">
      <SectionHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-10">
        <div className="mb-8">
          <p className="text-xs font-bold tracking-[0.2em] text-red-700">HARMONYNET CONTRIBUTOR</p>
          <h1 className="mt-2 font-serif text-3xl font-extrabold">하모니넷 기사 작성</h1>
          <p className="mt-3 text-sm leading-6 text-neutral-600">일반 가입자가 작성한 기사는 관리자 검토 후 공개되며, 승인된 기사 작성자는 바로 공개할 수 있습니다.</p>
          <p className="mt-1 text-sm leading-6 text-neutral-600">사진을 여러 장 첨부하고 본문에 배치할 수 있습니다. 더 체계적인 편집이 필요한 기사글은 <a href="http://huss.harmonynet.kr/wp-admin" target="_blank" rel="noopener noreferrer" className="font-semibold text-red-700 underline hover:no-underline">하모니넷 편집자 페이지</a>에서 작성해 주세요.</p>
          <p className="mt-1 text-sm leading-6 text-neutral-600"><a href="https://gemini.google.com/gem/1TilsgjEDuajEU30S-sKZNl_LGYzLvhw7?usp=sharing" target="_blank" rel="noopener noreferrer" className="font-semibold text-red-700 underline hover:no-underline">AI기사작성도우미</a>를 활용해 기사 초안을 작성해 보세요.</p>
        </div>

        {!firebaseConfigured ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
            Firebase 설정이 아직 완료되지 않았습니다. 관리자에게 Firebase 웹 앱 설정값 등록을 요청해 주세요.
          </div>
        ) : loading ? (
          <div className="h-32 animate-pulse rounded-lg bg-neutral-200" />
        ) : !user ? (
          <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="font-serif text-xl font-bold">로그인이 필요합니다</h2>
            <p className="mt-2 text-sm text-neutral-600">구글 계정으로 로그인한 뒤 기사 작성 권한을 신청할 수 있습니다.</p>
            <button onClick={() => signIn().catch((error) => setMessage(error instanceof Error ? error.message : '로그인에 실패했습니다.'))} className="mt-5 rounded bg-neutral-900 px-5 py-3 text-sm font-bold text-white hover:bg-red-700">Google로 로그인</button>
            {message && <p className="mt-3 text-sm text-red-700">{message}</p>}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between text-xs text-neutral-500"><span>{user.displayName || user.email}</span><button type="button" onClick={() => signOutUser()} className="text-red-700 hover:underline">로그아웃</button></div>
            <label className="block"><span className="mb-2 block text-sm font-bold">제목</span><input value={title} onChange={(event) => setTitle(event.target.value)} className="w-full rounded border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-red-700" placeholder="기사 제목을 입력하세요" /></label>
            <label className="block"><span className="mb-2 block text-sm font-bold">분야</span><select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded border border-neutral-300 px-4 py-3 text-sm"><option value="local">로컬소식</option><option value="huss">대학소식</option><option value="opinion">오피니언</option></select></label>
            <div className="block"><span className="mb-2 block text-sm font-bold">사진</span><input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => { const selectedFiles = Array.from(event.currentTarget.files || []); event.currentTarget.value = ''; setImageFiles((previous) => [...previous, ...selectedFiles]); }} className="block w-full rounded border border-neutral-300 px-3 py-2 text-sm" /><p className="mt-1 text-xs text-neutral-500">여러 장을 선택한 뒤, 본문에서 사진을 넣을 위치에 커서를 두고 해당 사진의 ‘본문에 삽입’을 누르세요. 첫 사진은 대표 썸네일로 사용됩니다.</p>{imageFiles.length > 0 && <ul className="mt-3 space-y-2">{imageFiles.map((imageFile, index) => <li key={`${imageFile.name}-${imageFile.lastModified}-${index}`} className="flex items-center gap-3 rounded bg-neutral-50 px-3 py-2 text-sm"><Image src={photoPreviewUrls[index] || TRANSPARENT_IMAGE} alt={`첨부 사진 ${index + 1}`} width={80} height={60} unoptimized className="h-14 w-20 shrink-0 rounded object-cover" /><span className="min-w-0 flex-1 truncate">사진 {index + 1}: {imageFile.name}</span><span className="flex shrink-0 gap-3"><button type="button" onClick={() => insertPhotoMarker(index)} className="font-semibold text-red-700 hover:underline">본문에 삽입 [사진{index + 1}]</button><button type="button" onClick={() => removePhoto(index)} className="text-neutral-500 hover:underline">삭제</button></span></li>)}</ul>}</div>
            <label className="block"><span className="mb-2 block text-sm font-bold">본문</span><textarea ref={contentRef} value={content} onChange={(event) => setContent(event.target.value)} className="min-h-80 w-full rounded border border-neutral-300 px-4 py-3 text-sm leading-7 outline-none focus:border-red-700" placeholder="기사 본문을 입력하세요. 사진을 넣으려면 [사진1] 같은 마커를 사용하세요." /></label>
            <div className="flex flex-wrap items-center gap-3"><select value={status} onChange={(event) => setStatus(event.target.value as 'draft' | 'pending' | 'published')} className="rounded border border-neutral-300 px-3 py-2 text-sm">{(role === 'writer' || role === 'admin') && <option value="published">바로 공개</option>}<option value="pending">검토 요청</option><option value="draft">임시저장</option></select><button disabled={saving} className="rounded bg-red-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-800 disabled:opacity-50">{saving ? '저장 중...' : '기사 저장'}</button></div>
            {message && <p className="text-sm text-red-700">{message}</p>}
          </form>
        )}
        <Link href="/" className="mt-6 inline-block text-sm font-semibold text-neutral-500 underline hover:text-red-700">← 메인으로 돌아가기</Link>
      </main>
      <SiteFooter />
    </div>
  );
}
