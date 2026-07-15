import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';
import { AuthFormLayout } from './AuthFormLayout';
import { Field, Input, Button } from './ui';

// Password reset itself is handled entirely by Firebase: this just triggers
// the email, and Firebase's own hosted page takes the user through setting a
// new password — no custom token/reset-page flow needed on our side.
export function ForgotPasswordForm({ loginPath }: { loginPath: string }) {
  const { sendReset } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendReset(email);
      setSent(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFormLayout title="Forgot password" subtitle="We'll send you a reset link">
      {sent ? (
        <div className="space-y-3 text-sm text-gray-600">
          <p>If that account exists, a password reset email has been sent — follow the link in the email to set a new password.</p>
          <Link to={loginPath} className="underline">
            Back to login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Email">
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Sending…' : 'Send Reset Link'}
          </Button>
          <Link to={loginPath} className="block text-center text-xs text-gray-500 underline">
            Back to login
          </Link>
        </form>
      )}
    </AuthFormLayout>
  );
}
