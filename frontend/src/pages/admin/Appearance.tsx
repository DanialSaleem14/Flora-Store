import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as websiteService from '../../services/websiteService';
import { getErrorMessage } from '../../services/api';
import type { Website } from '../../types';
import { Button, Card, Field, Input, PageHeader, Spinner } from '../../components/ui';
import { ImageUploader } from '../../components/ImageUploader';

const FONTS = ['Inter', 'Roboto', 'Poppins', 'Playfair Display', 'Georgia', 'Montserrat'];

export default function Appearance() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin-website'], queryFn: websiteService.getWebsite });
  const [appearance, setAppearance] = useState<Website['appearance'] | null>(null);

  useEffect(() => {
    if (data?.website) setAppearance(data.website.appearance);
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: () => websiteService.updateWebsite({ appearance: appearance! }),
    onSuccess: (res) => {
      qc.setQueryData(['admin-website'], { success: true, website: res.website });
      qc.invalidateQueries({ queryKey: ['website'] });
      toast.success('Appearance updated');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (isLoading || !appearance) return <Spinner />;

  const update = (patch: Partial<Website['appearance']>) => setAppearance({ ...appearance, ...patch });

  return (
    <div>
      <PageHeader
        title="Appearance"
        actions={
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Saving…' : 'Save Changes'}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <h3 className="font-medium">Colors</h3>
          {(['primaryColor', 'secondaryColor', 'accentColor'] as const).map((key) => (
            <Field key={key} label={key.replace('Color', ' Color').replace(/^\w/, (c) => c.toUpperCase())}>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={appearance[key]}
                  onChange={(e) => update({ [key]: e.target.value } as Partial<Website['appearance']>)}
                  className="h-9 w-12 rounded border border-gray-300"
                />
                <Input value={appearance[key]} onChange={(e) => update({ [key]: e.target.value } as Partial<Website['appearance']>)} />
              </div>
            </Field>
          ))}
        </Card>

        <Card className="space-y-4">
          <h3 className="font-medium">Typography & Buttons</h3>
          <Field label="Font Family">
            <select
              value={appearance.fontFamily}
              onChange={(e) => update({ fontFamily: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              {FONTS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Button Style">
            <select
              value={appearance.buttonStyle}
              onChange={(e) => update({ buttonStyle: e.target.value as Website['appearance']['buttonStyle'] })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="rounded">Rounded</option>
              <option value="square">Square</option>
              <option value="pill">Pill</option>
            </select>
          </Field>
          <Field label="Border Radius (px)">
            <Input value={appearance.borderRadius} onChange={(e) => update({ borderRadius: e.target.value })} />
          </Field>
          <Field label="Default Mode">
            <select
              value={appearance.defaultMode}
              onChange={(e) => update({ defaultMode: e.target.value as 'light' | 'dark' })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </Field>
        </Card>

        <Card className="space-y-4">
          <h3 className="font-medium">Favicon</h3>
          <ImageUploader multiple={false} folder="website" images={appearance.favicon ? [appearance.favicon] : []} onChange={(i) => update({ favicon: i[0] || '' })} />
        </Card>

        <Card className="space-y-4">
          <h3 className="font-medium">Banner Images</h3>
          <ImageUploader folder="website" images={appearance.bannerImages} onChange={(i) => update({ bannerImages: i })} />
        </Card>
      </div>
    </div>
  );
}
