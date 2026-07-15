import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import type { User } from '../types';
import * as authService from '../services/authService';

interface AuthState {
  user: User | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<User | null>;
  register: (name: string, email: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
  sendReset: (email: string) => Promise<void>;
  refresh: () => Promise<void>;
  claimFirstAdmin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Authentication (login/signup/session/password reset) is entirely handled by
// Firebase Auth on the client. This context just mirrors the Firebase session
// state and syncs it with the Firestore app-specific profile (role, name)
// keyed by the Firebase UID.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true });

  // Returns the synced profile directly (not just via state) so callers like
  // the login form can inspect the role immediately, without waiting on a
  // re-render to see the updated context state.
  const syncProfile = async (): Promise<User | null> => {
    if (!auth.currentUser) {
      setState({ user: null, loading: false });
      return null;
    }
    try {
      const res = await authService.getMe();
      setState({ user: res.user, loading: false });
      return res.user;
    } catch {
      setState({ user: null, loading: false });
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, () => {
      syncProfile();
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    return syncProfile();
  };

  const register = async (name: string, email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    return syncProfile();
  };

  const logout = async () => {
    await firebaseSignOut(auth);
    setState({ user: null, loading: false });
  };

  const sendReset = (email: string) => sendPasswordResetEmail(auth, email);

  const claimFirstAdmin = async () => {
    await authService.claimFirstAdmin();
    await syncProfile();
  };

  const refresh = async () => {
    await syncProfile();
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, sendReset, refresh, claimFirstAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export type { FirebaseUser };
