import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as websiteService from '../../services/websiteService';
import { getErrorMessage } from '../../services/api';
import type { HomepageSection, Testimonial, Website } from '../../types';
import { Button, Card, Field, Input, Textarea, PageHeader, Spinner, Toggle } from '../../components/ui';
import { ImageUploader } from '../../components/ImageUploader';
import { SortableList } from '../../components/SortableList';

const SECTION_LABELS: Record<HomepageSection['key'], string> = {
  hero: 'Hero Banner',
  featuredProducts: 'Featured Products',
  categories: 'Categories',
  promoBanner: 'Promotional Banner',
  latestProducts: 'Latest Products',
  testimonials: 'Customer Testimonials',
  newsletter: 'Newsletter',
};

export default function WebsiteBuilder() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin-website'], queryFn: websiteService.getWebsite });
  const [form, setForm] = useState<Website | null>(null);

  useEffect(() => {
    if (data?.website) setForm(data.website);
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (payload: Partial<Website>) => websiteService.updateWebsite(payload),
    onSuccess: (res) => {
      qc.setQueryData(['admin-website'], { success: true, website: res.website });
      qc.invalidateQueries({ queryKey: ['website'] });
      toast.success('Website updated');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (isLoading || !form) return <Spinner />;

  const updateTestimonial = (idx: number, patch: Partial<Testimonial>) => {
    const testimonials = [...form.testimonials];
    testimonials[idx] = { ...testimonials[idx], ...patch };
    setForm({ ...form, testimonials });
  };

  const removeTestimonial = (idx: number) => setForm({ ...form, testimonials: form.testimonials.filter((_, i) => i !== idx) });

  const addTestimonial = () =>
    setForm({ ...form, testimonials: [...form.testimonials, { name: '', text: '', rating: 5, avatar: '' }] });

  return (
    <div>
      <PageHeader
        title="Website Builder"
        actions={
          <Button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Saving…' : 'Save Changes'}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <h3 className="font-medium">Branding</h3>
          <Field label="Website Name">
            <Input value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} />
          </Field>
          <div>
            <span className="mb-1 block text-sm font-medium text-gray-700">Logo</span>
            <ImageUploader multiple={false} images={form.logo ? [form.logo] : []} onChange={(i) => setForm({ ...form, logo: i[0] || '' })} />
          </div>
        </Card>

        <Card className="space-y-4">
          <h3 className="font-medium">Hero Section</h3>
          <Field label="Title">
            <Input value={form.hero.title} onChange={(e) => setForm({ ...form, hero: { ...form.hero, title: e.target.value } })} />
          </Field>
          <Field label="Subtitle">
            <Input value={form.hero.subtitle} onChange={(e) => setForm({ ...form, hero: { ...form.hero, subtitle: e.target.value } })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Button Text">
              <Input value={form.hero.buttonText} onChange={(e) => setForm({ ...form, hero: { ...form.hero, buttonText: e.target.value } })} />
            </Field>
            <Field label="Button Link">
              <Input value={form.hero.buttonLink} onChange={(e) => setForm({ ...form, hero: { ...form.hero, buttonLink: e.target.value } })} />
            </Field>
          </div>
          <div>
            <span className="mb-1 block text-sm font-medium text-gray-700">Hero Image</span>
            <ImageUploader multiple={false} images={form.hero.image ? [form.hero.image] : []} onChange={(i) => setForm({ ...form, hero: { ...form.hero, image: i[0] || '' } })} />
          </div>
        </Card>

        <Card className="space-y-4">
          <h3 className="font-medium">About</h3>
          <Textarea rows={4} value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} />
        </Card>

        <Card className="space-y-4">
          <h3 className="font-medium">Contact Details</h3>
          <Field label="Email">
            <Input value={form.contact.email} onChange={(e) => setForm({ ...form, contact: { ...form.contact, email: e.target.value } })} />
          </Field>
          <Field label="Phone">
            <Input value={form.contact.phone} onChange={(e) => setForm({ ...form, contact: { ...form.contact, phone: e.target.value } })} />
          </Field>
          <Field label="Address">
            <Input value={form.contact.address} onChange={(e) => setForm({ ...form, contact: { ...form.contact, address: e.target.value } })} />
          </Field>
        </Card>

        <Card className="space-y-4 lg:col-span-2">
          <h3 className="font-medium">Social Media Links</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {(Object.keys(form.social) as (keyof Website['social'])[]).map((key) => (
              <Field key={key} label={key.charAt(0).toUpperCase() + key.slice(1)}>
                <Input value={form.social[key]} onChange={(e) => setForm({ ...form, social: { ...form.social, [key]: e.target.value } })} />
              </Field>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <h3 className="font-medium">Footer</h3>
          <Field label="Footer Text">
            <Textarea rows={3} value={form.footer.text} onChange={(e) => setForm({ ...form, footer: { ...form.footer, text: e.target.value } })} />
          </Field>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Testimonials</h3>
            <Button variant="secondary" onClick={addTestimonial} type="button">
              + Add
            </Button>
          </div>
          <div className="space-y-3">
            {form.testimonials.map((t, idx) => (
              <div key={idx} className="space-y-2 rounded-md border border-gray-200 p-3">
                <Input placeholder="Name" value={t.name} onChange={(e) => updateTestimonial(idx, { name: e.target.value })} />
                <Textarea placeholder="Testimonial text" rows={2} value={t.text} onChange={(e) => updateTestimonial(idx, { text: e.target.value })} />
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    className="w-20"
                    value={t.rating}
                    onChange={(e) => updateTestimonial(idx, { rating: Number(e.target.value) })}
                  />
                  <button type="button" className="text-xs text-red-600 underline" onClick={() => removeTestimonial(idx)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-4 lg:col-span-2">
          <h3 className="font-medium">Homepage Sections</h3>
          <p className="text-xs text-gray-500">Drag to reorder. Toggle to enable or disable a section.</p>
          <SortableList
            items={form.homepageSections.map((s) => ({ ...s, id: s.key }))}
            onReorder={(items) =>
              setForm({ ...form, homepageSections: items.map((it, idx) => ({ key: it.key, enabled: it.enabled, order: idx })) })
            }
            renderItem={(item) => (
              <div className="flex items-center justify-between">
                <span className="text-sm">{SECTION_LABELS[item.key]}</span>
                <Toggle
                  checked={item.enabled}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      homepageSections: form.homepageSections.map((s) => (s.key === item.key ? { ...s, enabled: v } : s)),
                    })
                  }
                />
              </div>
            )}
          />
        </Card>
      </div>
    </div>
  );
}
