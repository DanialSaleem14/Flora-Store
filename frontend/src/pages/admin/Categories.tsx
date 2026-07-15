import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as categoryService from '../../services/categoryService';
import { getErrorMessage } from '../../services/api';
import type { Category } from '../../types';
import { Button, Card, EmptyState, Field, Input, Textarea, PageHeader, Spinner, Toggle } from '../../components/ui';
import { ImageUploader } from '../../components/ImageUploader';

const EMPTY: Partial<Category> = { name: '', description: '', image: '', featured: false };

export default function AdminCategories() {
  const qc = useQueryClient();
  const [form, setForm] = useState<Partial<Category>>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: ['admin-categories'], queryFn: categoryService.getCategories });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-categories'] });

  const saveMutation = useMutation({
    mutationFn: () =>
      editingId ? categoryService.updateCategory(editingId, form) : categoryService.createCategory(form),
    onSuccess: () => {
      invalidate();
      qc.invalidateQueries({ queryKey: ['categories'] });
      toast.success(editingId ? 'Category updated' : 'Category created');
      setForm(EMPTY);
      setEditingId(null);
      setShowForm(false);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: categoryService.deleteCategory,
    onSuccess: () => {
      invalidate();
      toast.success('Category deleted');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const startEdit = (c: Category) => {
    setForm(c);
    setEditingId(c._id);
    setShowForm(true);
  };

  return (
    <div>
      <PageHeader
        title="Categories"
        actions={
          <Button
            onClick={() => {
              setForm(EMPTY);
              setEditingId(null);
              setShowForm((s) => !s);
            }}
          >
            {showForm ? 'Cancel' : '+ Add Category'}
          </Button>
        }
      />

      {showForm && (
        <Card className="mb-6 space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveMutation.mutate();
            }}
            className="space-y-4"
          >
            <Field label="Name">
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Description">
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
            <div>
              <span className="mb-1 block text-sm font-medium text-gray-700">Image</span>
              <ImageUploader
                multiple={false}
                images={form.image ? [form.image] : []}
                onChange={(imgs) => setForm({ ...form, image: imgs[0] || '' })}
              />
            </div>
            <Toggle checked={!!form.featured} onChange={(v) => setForm({ ...form, featured: v })} label="Featured" />
            <Button type="submit" disabled={saveMutation.isPending}>
              {editingId ? 'Update' : 'Create'}
            </Button>
          </form>
        </Card>
      )}

      {isLoading ? (
        <Spinner />
      ) : !data?.categories.length ? (
        <EmptyState title="No categories yet" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.categories.map((c) => (
            <Card key={c._id} className="flex flex-col">
              <img
                src={c.image || 'https://placehold.co/300x160?text=' + encodeURIComponent(c.name)}
                alt={c.name}
                className="mb-3 h-32 w-full rounded-md object-cover"
                loading="lazy"
              />
              <h3 className="font-medium">{c.name}</h3>
              {c.featured && <span className="mt-1 w-fit rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700">Featured</span>}
              <div className="mt-3 flex gap-3 text-xs">
                <button className="underline" onClick={() => startEdit(c)}>
                  Edit
                </button>
                <button
                  className="text-red-600 underline"
                  onClick={() => {
                    if (confirm('Delete this category?')) deleteMutation.mutate(c._id);
                  }}
                >
                  Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
