import axios from 'axios';
import { auth } from '../config/firebase';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Every request carries a fresh Firebase ID token when the user is signed
// in — Firebase's SDK transparently refreshes it under the hood, so this is
// always valid for at least a few minutes and self-renewing.
api.interceptors.request.use(async (config) => {
  if (auth.currentUser) {
    const token = await auth.currentUser.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/invalid-email': 'That email address looks invalid.',
  'auth/weak-password': 'Password should be at least 6 characters.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/user-not-found': 'No account found with that email.',
  'auth/wrong-password': 'Incorrect email or password.',
  'storage/unauthorized': "You don't have permission to upload files.",
};

const isFirebaseError = (error: unknown): error is { code: string; message: string } =>
  typeof error === 'object' && error !== null && 'code' in error && typeof (error as { code: unknown }).code === 'string';

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || 'Something went wrong';
  }
  if (isFirebaseError(error)) {
    return FIREBASE_ERROR_MESSAGES[error.code] || error.message.replace(/^Firebase:\s*/, '');
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong';
};
