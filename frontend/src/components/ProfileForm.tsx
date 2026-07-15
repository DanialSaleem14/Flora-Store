import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { updateMe } from '../services/authService';
import { getErrorMessage } from '../services/api';
import { Button, Card, Field, Input } from './ui';

export function ProfileForm() {
  const { user, refresh, sendReset } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [savingName, setSavingName] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingName(true);
    try {
      await updateMe({ name });
      await refresh();
      toast.success('Profile updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingName(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setSendingReset(true);
    try {
      await sendReset(user.email);
      toast.success(`Password reset email sent to ${user.email}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSendingReset(false);
    }
  };

  return (
    <Card className="max-w-md space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Name">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Email">
          <Input type="email" value={user?.email || ''} disabled className="bg-gray-50 text-gray-500" />
        </Field>
        <Button type="submit" disabled={savingName}>
          {savingName ? 'Saving…' : 'Save Changes'}
        </Button>
      </form>

      <div className="border-t border-gray-100 pt-4">
        <p className="mb-2 text-sm text-gray-500">
          Password is managed by your login provider — we'll email you a secure link to change it.
        </p>
        <Button variant="secondary" onClick={handlePasswordReset} disabled={sendingReset}>
          {sendingReset ? 'Sending…' : 'Send Password Reset Email'}
        </Button>
      </div>
    </Card>
  );
}
