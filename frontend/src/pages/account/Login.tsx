import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../services/api';
import { AuthFormLayout } from '../../components/AuthFormLayout';
import { Field, Input, Button } from '../../components/ui';

export default function CustomerLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      const redirectTo = (location.state as { from?: Location })?.from?.pathname || '/account';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFormLayout title="Sign in" subtitle="Access your account">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Email">
          <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Password">
          <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Signing in…' : 'Sign In'}
        </Button>
      </form>
      <div className="mt-4 flex justify-between text-xs text-gray-500">
        <Link to="/account/forgot-password" className="underline">
          Forgot password?
        </Link>
        <Link to="/account/register" className="underline">
          Create account
        </Link>
      </div>
    </AuthFormLayout>
  );
}
