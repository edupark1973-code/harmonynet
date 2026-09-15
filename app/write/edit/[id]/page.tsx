'use client';

import Link from 'next/link';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { FormEvent, use, useEffect, useState } from 'react';
import { getDb, getStorageClient } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';
import { SectionHeader } from '@/components/SectionShell';
import SiteFooter from '@/components/SiteFooter';

type EditPageProps = { params: Promise<{ id: string }> };

export default function EditArticlePage({ params }: EditPageProps) {
  const { id } = use(params);
  const { user, loading } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('local');
  const [status, setStatus] = useState<'draft' | 'pending'>('pending');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
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
      setStatus(data.status === 'draft' ? 'draft' : 'pending');
      setImageUrl(data.imageUrl || '');
      setReady(true);
    }).catch(() => setMessage('기사를 불러오지 못했습니다.'));
  }, [id, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !ready || !title.trim() || !content.trim() || (!imageUrl && !imageFile)) {
      setMessage('제목, 대표이미지, 본문을 모두 입력해 주세요.');
      return;
    }
    setSaving(true);
    try {
      let nextImageUrl = imageUrl;
      if (imageFile) {
        const imageRef = ref(getStorageClient(), `article-images/${user.uid}/${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`);
        nextImageUrl = await getDownloadURL((await uploadBytes(imageRef, imageFile, { contentType: imageFile.type })).ref);
      }
      await updateDoc(doc(getDb(), 'localPosts', id), { title: title.trim(), content: content.trim(), category, status, imageUrl: nextImageUrl, imageAlt: title.trim(), updatedAt: new Date().toISOString() });
      setImageUrl(nextImageUrl);
      setImageFile(null);
      setMessage(status === 'pending' && imageUrl ? '수정되었습니다. 관리자 재승인 후 공개됩니다.' : '기사가 수정되었습니다.');
    } catch (error) {
      console.error('Local article update error:', error);
      setMessage('수정하지 못했습니다.');
    } finally {
      setSaving(false);
    }
  }

  return <div className="min-h-screen bg-[#f8f9fa] text-neutral-900 antialiased"><SectionHeader /><main className="mx-auto w-full max-w-3xl px-4 py-10"><p className="text-xs font-bold tracking-[0.2em] text-red-700">EDIT ARTICLE</p><h1 className="mt-2 font-serif text-3xl font-extrabold">기사 수정</h1>{loading ? <div className="mt-8 h-32 animate-pulse rounded bg-neutral-200" /> : !user ? <div className="mt-8 rounded-lg border border-neutral-200 bg-white p-6 text-sm">로그인이 필요합니다.</div> : !ready ? <div className="mt-8 rounded-lg border border-neutral-200 bg-white p-6 text-sm text-red-700">{message || '기사를 불러오는 중입니다.'}</div> : <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm"><label className="block"><span className="mb-2 block text-sm font-bold">제목</span><input value={title} onChange={(event) => setTitle(event.target.value)} className="w-full rounded border border-neutral-300 px-4 py-3 text-sm" /></label><label className="block"><span className="mb-2 block text-sm font-bold">분야</span><select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded border border-neutral-300 px-4 py-3 text-sm"><option value="local">로컬소식</option><option value="huss">HUSS소식</option><option value="opinion">오피니언</option></select></label><label className="block"><span className="mb-2 block text-sm font-bold">대표이미지 교체</span><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => setImageFile(event.target.files?.[0] || null)} className="block w-full rounded border border-neutral-300 px-3 py-2 text-sm" /><p className="mt-1 text-xs text-neutral-500">새 이미지를 선택하지 않으면 기존 이미지를 유지합니다.</p></label><label className="block"><span className="mb-2 block text-sm font-bold">본문</span><textarea value={content} onChange={(event) => setContent(event.target.value)} className="min-h-80 w-full rounded border border-neutral-300 px-4 py-3 text-sm leading-7" /></label><div className="flex flex-wrap gap-3"><select value={status} onChange={(event) => setStatus(event.target.value as 'draft' | 'pending')} className="rounded border border-neutral-300 px-3 py-2 text-sm"><option value="pending">수정 후 재검토 요청</option><option value="draft">임시저장</option></select><button disabled={saving} className="rounded bg-red-700 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">{saving ? '저장 중...' : '수정 저장'}</button></div>{message && <p className="text-sm text-red-700">{message}</p>}</form>}<Link href="/write/my" className="mt-6 inline-block text-sm font-semibold text-neutral-500 hover:text-red-700">← 내 기사로 돌아가기</Link></main><SiteFooter /></div>;
}
