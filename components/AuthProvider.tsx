'use client';

import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getAuthClient, getDb, googleProvider, isFirebaseConfigured } from '@/lib/firebase';

type UserRole = 'reader' | 'writer' | 'admin';

type AuthContextValue = {
  user: User | null;
  role: UserRole;
  loading: boolean;
  firebaseConfigured: boolean;
  signIn: () => Promise<void>;
  signOutUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('reader');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const auth = getAuthClient();
    const db = getDb();
    return onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      setRole('reader');
      if (nextUser) {
        const profileRef = doc(db, 'users', nextUser.uid);
        const profile = await getDoc(profileRef);
        if (!profile.exists()) {
          await setDoc(profileRef, {
            displayName: nextUser.displayName || '하모니넷 사용자',
            email: nextUser.email || '',
            role: 'reader',
            createdAt: new Date().toISOString(),
          });
        } else {
          const savedRole = profile.data().role;
          if (savedRole === 'writer' || savedRole === 'admin') setRole(savedRole);
        }
      }
      setLoading(false);
    });
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    role,
    loading,
    firebaseConfigured: isFirebaseConfigured,
    signIn: async () => {
      if (!isFirebaseConfigured) throw new Error('Firebase 설정이 아직 완료되지 않았습니다.');
      await signInWithPopup(getAuthClient(), googleProvider);
    },
    signOutUser: async () => {
      await signOut(getAuthClient());
    },
  }), [loading, role, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
