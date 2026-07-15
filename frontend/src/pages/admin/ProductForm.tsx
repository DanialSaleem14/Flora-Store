import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as productService from '../../services/productService';
import { getCategories } from '../../services/categoryService';
import { getErrorMessage } from '../../services/api';
import { Card, Field, Input, Textarea, Button, PageHeader, Toggle, Spinner } from '../../components/ui';
import { ImageUploader } from '../../components/ImageUploader';

const EMPTY_FORM = {
  name: '',
  slug: '',
  price: 0,
  discountPrice: undefined as number | undefined,
  description: '',
  shortDescription: '',
  sku: '',
  stock: 0,
  category: '',
  tags: '' as string,
  featured: false,
  published: true,
  images: [] as string[],
};

export default function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const { data: categoriesData } = useQuery({ queryKey: ['categories'], queryFn: getCategories });

  const { data: productData, isLoading } = useQuery({
    queryKey: ['admin-product', id],
    queryFn: () => productService.getProductById(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (productData?.product) {
      const p = productData.product;
      setForm({
        name: p.name,
        slug: p.slug,
        price: p.price,
        discountPrice: p.discountPrice ?? undefined,
        description: p.description,
        shortDescription: p.shortDescription,
        sku: p.sku,
        stock: p.stock,
        category: typeof p.category === 'object' && p.category ? p.category._id : (p.category as string) || '',
        tags: p.tags.join(', '),
        featured: p.featured,
        published: p.published,
        images: p.images,
      });
    }
  }, [productData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      discountPrice: form.discountPrice || null,
      category: form.category || null,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };
    try {
      if (isEdit) {
        await productService.updateProduct(id!, payload);
        toast.success('Product updated');
      } else {
        await productService.createProduct(payload);
        toast.success('Product created');
      }
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      navigate('/admin/products');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (isEdit && isLoading) return <Spinner />;

  return (
    <div>
      <PageHeader title={isEdit ? 'Edit Product' : 'Add Product'} />
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="space-y-4">
            <Field label="Product Name">
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Short Description">
              <Input value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} />
            </Field>
            <Field label="Description">
              <Textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
          </Card>

          <Card className="space-y-4">
            <h3 className="font-medium">Images</h3>
            <ImageUploader images={form.images} onChange={(images) => setForm({ ...form, images })} />
          </Card>

          <Card className="space-y-4">
            <h3 className="font-medium">Pricing & Inventory</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Price">
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  required
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                />
              </Field>
              <Field label="Discount Price">
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  value={form.discountPrice ?? ''}
                  onChange={(e) => setForm({ ...form, discountPrice: e.target.value ? Number(e.target.value) : undefined })}
                />
              </Field>
              <Field label="SKU">
                <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
              </Field>
              <Field label="Stock">
                <Input type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
              </Field>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="space-y-4">
            <Toggle checked={form.published} onChange={(v) => setForm({ ...form, published: v })} label="Published" />
            <Toggle checked={form.featured} onChange={(v) => setForm({ ...form, featured: v })} label="Featured Product" />
          </Card>

          <Card className="space-y-4">
            <Field label="Category">
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">None</option>
                {categoriesData?.categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Tags (comma separated)">
              <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
            </Field>
          </Card>

          <Button type="submit" disabled={saving} className="w-full">
            {saving ? 'Saving…' : isEdit ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </form>
    </div>
  );
}
