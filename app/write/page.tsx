'use client';

import Link from 'next/link';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { FormEvent, useState } from 'react';
import { getDb, getStorageClient } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';
import { SectionHeader } from '@/components/SectionShell';
import SiteFooter from '@/components/SiteFooter';

export default function WritePage() {
  const { user, role, loading, firebaseConfigured, signIn, signOutUser } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('local');
  const [status, setStatus] = useState<'draft' | 'pending'>('pending');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || (role !== 'writer' && role !== 'admin')) return;
    if (!title.trim() || !content.trim()) {
      setMessage('제목과 본문을 입력해 주세요.');
      return;
    }
    if (!imageFile) {
      setMessage('대표이미지를 등록해 주세요. 대표이미지는 본문 맨 위에도 자동으로 들어갑니다.');
      return;
    }

    setSaving(true);
    setMessage('');
    try {
      let imageUrl = '';
      if (imageFile) {
        const imageRef = ref(getStorageClient(), `article-images/${user.uid}/${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`);
        const uploaded = await uploadBytes(imageRef, imageFile, { contentType: imageFile.type });
        imageUrl = await getDownloadURL(uploaded.ref);
      }

      await addDoc(collection(getDb(), 'localPosts'), {
        title: title.trim(),
        content: content.trim(),
        category,
        status,
        authorId: user.uid,
        authorName: user.displayName || '하모니넷 작성자',
        authorEmail: user.email || '',
        imageUrl,
        imageAlt: title.trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setTitle('');
      setContent('');
      setImageFile(null);
      setMessage(status === 'draft' ? '임시저장되었습니다.' : '검토 요청이 접수되었습니다. 관리자 승인 후 공개됩니다.');
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
          <p className="mt-3 text-sm leading-6 text-neutral-600">작성된 기사는 관리자 검토 후 하모니넷에 공개됩니다.</p>
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
        ) : role !== 'writer' && role !== 'admin' ? (
          <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="font-serif text-xl font-bold">작성 권한 승인 대기 중입니다</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">현재 계정은 로그인되었지만 아직 기사 작성자로 승인되지 않았습니다. 관리자 승인 후 작성할 수 있습니다.</p>
            <button onClick={() => signOutUser()} className="mt-5 text-sm font-semibold text-red-700 hover:underline">로그아웃</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between text-xs text-neutral-500"><span>{user.displayName || user.email}</span><button type="button" onClick={() => signOutUser()} className="text-red-700 hover:underline">로그아웃</button></div>
            <label className="block"><span className="mb-2 block text-sm font-bold">제목</span><input value={title} onChange={(event) => setTitle(event.target.value)} className="w-full rounded border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-red-700" placeholder="기사 제목을 입력하세요" /></label>
            <label className="block"><span className="mb-2 block text-sm font-bold">분야</span><select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded border border-neutral-300 px-4 py-3 text-sm"><option value="local">로컬소식</option><option value="huss">HUSS소식</option><option value="opinion">오피니언</option></select></label>
            <label className="block"><span className="mb-2 block text-sm font-bold">대표이미지</span><input required type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => setImageFile(event.target.files?.[0] || null)} className="block w-full rounded border border-neutral-300 px-3 py-2 text-sm" /><p className="mt-1 text-xs text-neutral-500">JPG, PNG, WebP, GIF / 10MB 이하 · 본문 맨 위에도 자동 삽입됩니다.</p></label>
            <label className="block"><span className="mb-2 block text-sm font-bold">본문</span><textarea value={content} onChange={(event) => setContent(event.target.value)} className="min-h-80 w-full rounded border border-neutral-300 px-4 py-3 text-sm leading-7 outline-none focus:border-red-700" placeholder="기사 본문을 입력하세요" /></label>
            <div className="flex flex-wrap items-center gap-3"><select value={status} onChange={(event) => setStatus(event.target.value as 'draft' | 'pending')} className="rounded border border-neutral-300 px-3 py-2 text-sm"><option value="pending">검토 요청</option><option value="draft">임시저장</option></select><button disabled={saving} className="rounded bg-red-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-800 disabled:opacity-50">{saving ? '저장 중...' : '기사 저장'}</button></div>
            {message && <p className="text-sm text-red-700">{message}</p>}
          </form>
        )}
        <Link href="/" className="mt-6 inline-block text-sm font-semibold text-neutral-500 hover:text-red-700">← 메인으로 돌아가기</Link>
      </main>
      <SiteFooter />
    </div>
  );
}
