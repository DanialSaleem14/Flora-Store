import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../services/api';
import { AuthFormLayout } from '../../components/AuthFormLayout';
import { Field, Input, Button } from '../../components/ui';

export default function CustomerRegister() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/account', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFormLayout title="Create account" subtitle="Join to track orders and save favorites">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Name">
          <Input required value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Email">
          <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Password">
          <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Creating…' : 'Create Account'}
        </Button>
      </form>
      <div className="mt-4 text-center text-xs text-gray-500">
        Already have an account?{' '}
        <Link to="/account/login" className="underline">
          Sign in
        </Link>
      </div>
    </AuthFormLayout>
  );
}
