import { ProfileForm } from '../../components/ProfileForm';
import { PageHeader } from '../../components/ui';

export default function AdminProfile() {
  return (
    <div>
      <PageHeader title="Profile" />
      <ProfileForm />
    </div>
  );
}
