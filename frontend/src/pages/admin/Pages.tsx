import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as pageService from '../../services/pageService';
import { getErrorMessage } from '../../services/api';
import type { Page } from '../../types';
import { Button, Card, Field, Input, PageHeader, Spinner, Textarea } from '../../components/ui';
import { RichTextEditor } from '../../components/RichTextEditor';

export default function AdminPages() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin-pages'], queryFn: pageService.getPages });
  const [selected, setSelected] = useState<Page | null>(null);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-pages'] });

  const saveMutation = useMutation({
    mutationFn: (page: Page) => pageService.updatePage(page._id, page),
    onSuccess: () => {
      invalidate();
      toast.success('Page saved');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const createMutation = useMutation({
    mutationFn: () => pageService.createPage({ title: newTitle, content: '' }),
    onSuccess: () => {
      invalidate();
      toast.success('Page created');
      setCreating(false);
      setNewTitle('');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: pageService.deletePage,
    onSuccess: () => {
      invalidate();
      setSelected(null);
      toast.success('Page deleted');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (isLoading) return <Spinner />;

  if (selected) {
    return (
      <div>
        <PageHeader
          title={`Edit: ${selected.title}`}
          actions={
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setSelected(null)}>
                Back
              </Button>
              <Button onClick={() => saveMutation.mutate(selected)} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saving…' : 'Save'}
              </Button>
            </div>
          }
        />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Card>
              <Field label="Title">
                <Input value={selected.title} onChange={(e) => setSelected({ ...selected, title: e.target.value })} />
              </Field>
            </Card>
            <Card>
              <span className="mb-2 block text-sm font-medium text-gray-700">Content</span>
              <RichTextEditor value={selected.content} onChange={(html) => setSelected({ ...selected, content: html })} />
            </Card>
          </div>
          <Card className="space-y-4">
            <h3 className="font-medium">SEO</h3>
            <Field label="Meta Title">
              <Input value={selected.metaTitle} onChange={(e) => setSelected({ ...selected, metaTitle: e.target.value })} />
            </Field>
            <Field label="Meta Description">
              <Textarea rows={3} value={selected.metaDescription} onChange={(e) => setSelected({ ...selected, metaDescription: e.target.value })} />
            </Field>
            {!selected.isSystem && (
              <Button
                variant="danger"
                onClick={() => {
                  if (confirm('Delete this page?')) deleteMutation.mutate(selected._id);
                }}
              >
                Delete Page
              </Button>
            )}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Pages"
        actions={
          <Button onClick={() => setCreating((c) => !c)}>{creating ? 'Cancel' : '+ New Page'}</Button>
        }
      />

      {creating && (
        <Card className="mb-6 flex items-end gap-3">
          <Field label="Page Title" className="flex-1">
            <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
          </Field>
          <Button onClick={() => createMutation.mutate()} disabled={!newTitle || createMutation.isPending}>
            Create
          </Button>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data?.pages.map((p) => (
          <Card key={p._id} className="flex items-center justify-between">
            <div>
              <p className="font-medium">{p.title}</p>
              <p className="text-xs text-gray-500">/{p.slug}</p>
            </div>
            <button className="text-xs underline" onClick={() => setSelected(p)}>
              Edit
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
