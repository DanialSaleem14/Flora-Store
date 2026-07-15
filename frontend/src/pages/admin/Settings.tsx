import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as websiteService from '../../services/websiteService';
import { getErrorMessage } from '../../services/api';
import type { Website } from '../../types';
import { Button, Card, Field, Input, PageHeader, Spinner, Textarea } from '../../components/ui';

export default function Settings() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin-website'], queryFn: websiteService.getWebsite });
  const [settings, setSettings] = useState<Website['settings'] | null>(null);

  useEffect(() => {
    if (data?.website) setSettings(data.website.settings);
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: () => websiteService.updateWebsite({ settings: settings! }),
    onSuccess: (res) => {
      qc.setQueryData(['admin-website'], { success: true, website: res.website });
      qc.invalidateQueries({ queryKey: ['website'] });
      toast.success('Settings updated');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (isLoading || !settings) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Settings"
        actions={
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Saving…' : 'Save Changes'}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <h3 className="font-medium">Store Information</h3>
          <Field label="Store Email">
            <Input value={settings.storeEmail} onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })} />
          </Field>
          <Field label="Phone Number">
            <Input value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} />
          </Field>
          <Field label="Business Address">
            <Input value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Currency">
              <Input value={settings.currency} onChange={(e) => setSettings({ ...settings, currency: e.target.value })} />
            </Field>
            <Field label="Timezone">
              <Input value={settings.timezone} onChange={(e) => setSettings({ ...settings, timezone: e.target.value })} />
            </Field>
            <Field label="Language">
              <Input value={settings.language} onChange={(e) => setSettings({ ...settings, language: e.target.value })} />
            </Field>
          </div>
        </Card>

        <Card className="space-y-4">
          <h3 className="font-medium">SEO Settings</h3>
          <Field label="Meta Title">
            <Input value={settings.seo.metaTitle} onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, metaTitle: e.target.value } })} />
          </Field>
          <Field label="Meta Description">
            <Textarea
              rows={3}
              value={settings.seo.metaDescription}
              onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, metaDescription: e.target.value } })}
            />
          </Field>
          <Field label="Meta Keywords">
            <Input value={settings.seo.metaKeywords} onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, metaKeywords: e.target.value } })} />
          </Field>
          <Field label="Google Analytics ID">
            <Input value={settings.seo.gaId} onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, gaId: e.target.value } })} />
          </Field>
        </Card>
      </div>
    </div>
  );
}
