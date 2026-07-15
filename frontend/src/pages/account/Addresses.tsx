import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as customerService from '../../services/customerService';
import { getErrorMessage } from '../../services/api';
import type { Address } from '../../types';
import { Card, Field, Input, Button, EmptyState, Spinner, Toggle } from '../../components/ui';

const EMPTY: Address = { label: 'Home', line1: '', line2: '', city: '', state: '', zip: '', country: '', phone: '', isDefault: false };

export default function AccountAddresses() {
  const qc = useQueryClient();
  const [form, setForm] = useState<Address>(EMPTY);
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: ['addresses'], queryFn: customerService.getAddresses });

  const addMutation = useMutation({
    mutationFn: customerService.addAddress,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['addresses'] });
      setForm(EMPTY);
      setShowForm(false);
      toast.success('Address added');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: customerService.deleteAddress,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Address removed');
    },
  });

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Addresses</h2>
        <Button onClick={() => setShowForm((s) => !s)} variant="secondary">
          {showForm ? 'Cancel' : 'Add Address'}
        </Button>
      </div>

      {showForm && (
        <Card className="space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addMutation.mutate(form);
            }}
            className="space-y-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <Field label="Label">
                <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
              </Field>
              <Field label="Country">
                <Input required value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
              </Field>
            </div>
            <Field label="Address Line 1">
              <Input required value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="City">
                <Input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </Field>
              <Field label="State">
                <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
              </Field>
              <Field label="ZIP">
                <Input value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} />
              </Field>
            </div>
            <Toggle checked={form.isDefault} onChange={(v) => setForm({ ...form, isDefault: v })} label="Set as default" />
            <Button type="submit" disabled={addMutation.isPending}>
              Save Address
            </Button>
          </form>
        </Card>
      )}

      {!data?.addresses.length ? (
        <EmptyState title="No saved addresses yet" />
      ) : (
        <div className="space-y-3">
          {data.addresses.map((addr) => (
            <Card key={addr._id} className="flex items-center justify-between">
              <div className="text-sm">
                <p className="font-medium">
                  {addr.label} {addr.isDefault && <span className="text-xs text-gray-500">(Default)</span>}
                </p>
                <p className="text-gray-600">
                  {addr.line1}, {addr.city} {addr.state}, {addr.country}
                </p>
              </div>
              <Button variant="danger" onClick={() => deleteMutation.mutate(addr._id!)}>
                Delete
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
