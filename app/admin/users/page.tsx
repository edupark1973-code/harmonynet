'use client';

import Link from 'next/link';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { getDb } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';
import { SectionHeader } from '@/components/SectionShell';
import SiteFooter from '@/components/SiteFooter';

type UserProfile = {
  id: string;
  displayName?: string;
  email?: string;
  role?: 'reader' | 'writer' | 'admin';
  createdAt?: string;
};

const ROLE_LABELS = {
  reader: '일반 가입자',
  writer: '기사 작성자',
  admin: '관리자',
};

export default function AdminUsersPage() {
  const { user, role, loading } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [message, setMessage] = useState('');

  async function loadUsers() {
    if (role !== 'admin') return;
    const snapshot = await getDocs(collection(getDb(), 'users'));
    const nextUsers = snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as UserProfile));
    nextUsers.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    setUsers(nextUsers);
  }

  useEffect(() => {
    loadUsers().catch(() => setMessage('사용자 명단을 불러오지 못했습니다.'));
  }, [role]);

  async function changeRole(id: string, nextRole: 'reader' | 'writer') {
    await updateDoc(doc(getDb(), 'users', id), { role: nextRole });
    setMessage(nextRole === 'writer' ? '기사 작성 권한을 승인했습니다.' : '기사 작성 권한을 해제했습니다.');
    await loadUsers();
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-neutral-900 antialiased">
      <SectionHeader />
      <main className="mx-auto w-full max-w-5xl px-4 py-10">
        <p className="text-xs font-bold tracking-[0.2em] text-red-700">HARMONYNET ADMIN</p>
        <h1 className="mt-2 font-serif text-3xl font-extrabold">사용자 관리</h1>
        {loading ? <div className="mt-8 h-32 animate-pulse rounded bg-neutral-200" /> : !user || role !== 'admin' ? (
          <div className="mt-8 rounded-lg border border-neutral-200 bg-white p-6 text-sm">관리자 권한이 필요합니다.</div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
            <div className="border-b border-neutral-200 bg-neutral-50 px-5 py-4 text-sm text-neutral-600">가입자 {users.length}명 · 기사 작성 권한을 승인하거나 해제할 수 있습니다.</div>
            {users.length === 0 ? <p className="p-6 text-sm text-neutral-500">가입한 사용자가 없습니다.</p> : <div className="divide-y divide-neutral-200">{users.map((profile) => <div key={profile.id} className="flex flex-wrap items-center justify-between gap-4 p-5"><div className="min-w-0"><p className="font-bold">{profile.displayName || '이름 없음'}</p><p className="mt-1 text-sm text-neutral-500">{profile.email || '이메일 없음'}</p><p className="mt-1 text-xs text-neutral-400">가입일 {profile.createdAt ? new Date(profile.createdAt).toLocaleString('ko-KR') : '확인 불가'}</p></div><div className="flex items-center gap-3"><span className="text-xs font-bold text-red-700">{ROLE_LABELS[profile.role || 'reader']}</span>{profile.role !== 'admin' && <button onClick={() => changeRole(profile.id, profile.role === 'writer' ? 'reader' : 'writer')} className="rounded border border-neutral-300 px-3 py-2 text-xs font-bold hover:border-red-700 hover:text-red-700">{profile.role === 'writer' ? '작성 권한 해제' : '기사 작성 승인'}</button>}</div></div>)}</div>}
            {message && <p className="border-t border-neutral-200 bg-neutral-50 p-4 text-sm text-red-700">{message}</p>}
          </div>
        )}
        <Link href="/admin/articles" className="mt-6 inline-block text-sm font-semibold text-neutral-500 underline hover:text-red-700">기사 관리로 돌아가기</Link>
      </main>
      <SiteFooter />
    </div>
  );
}
