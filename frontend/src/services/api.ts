const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/invalid-email': 'That email address looks invalid.',
  'auth/weak-password': 'Password should be at least 6 characters.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/user-not-found': 'No account found with that email.',
  'auth/wrong-password': 'Incorrect email or password.',
  'storage/unauthorized': "You don't have permission to upload files.",
  'permission-denied': "You don't have permission to do that.",
};

const isFirebaseError = (error: unknown): error is { code: string; message: string } =>
  typeof error === 'object' && error !== null && 'code' in error && typeof (error as { code: unknown }).code === 'string';

export const getErrorMessage = (error: unknown): string => {
  if (isFirebaseError(error)) {
    return FIREBASE_ERROR_MESSAGES[error.code] || error.message.replace(/^Firebase:\s*/, '');
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong';
};
