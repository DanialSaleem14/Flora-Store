import mongoose from 'mongoose';
import slugify from 'slugify';

const pageSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true }, // e.g. home, about, contact, privacy, terms, faq, return-policy, or custom-<id>
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    content: { type: String, default: '' }, // rich text HTML
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true }
);

pageSchema.pre('validate', function generateSlug(next) {
  if (this.title && !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

export default mongoose.model('Page', pageSchema);
