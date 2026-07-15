import mongoose from 'mongoose';

const heroSchema = new mongoose.Schema(
  {
    title: { type: String, default: 'Welcome to our store' },
    subtitle: { type: String, default: 'Discover products you will love.' },
    image: { type: String, default: '' },
    buttonText: { type: String, default: 'Shop Now' },
    buttonLink: { type: String, default: '/products' },
  },
  { _id: false }
);

const footerSchema = new mongoose.Schema(
  {
    text: { type: String, default: '' },
    columns: [
      {
        title: { type: String },
        links: [{ label: String, url: String }],
      },
    ],
  },
  { _id: false }
);

const contactSchema = new mongoose.Schema(
  {
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
  },
  { _id: false }
);

const socialSchema = new mongoose.Schema(
  {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    youtube: { type: String, default: '' },
    tiktok: { type: String, default: '' },
  },
  { _id: false }
);

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    text: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    avatar: { type: String, default: '' },
  },
  { timestamps: false }
);

const sectionSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      enum: [
        'hero',
        'featuredProducts',
        'categories',
        'promoBanner',
        'latestProducts',
        'testimonials',
        'newsletter',
      ],
      required: true,
    },
    enabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const appearanceSchema = new mongoose.Schema(
  {
    primaryColor: { type: String, default: '#1a1a1a' },
    secondaryColor: { type: String, default: '#f5f5f5' },
    accentColor: { type: String, default: '#4f46e5' },
    fontFamily: { type: String, default: 'Inter' },
    buttonStyle: { type: String, enum: ['rounded', 'square', 'pill'], default: 'rounded' },
    borderRadius: { type: String, default: '8px' },
    defaultMode: { type: String, enum: ['light', 'dark'], default: 'light' },
    favicon: { type: String, default: '' },
    bannerImages: [{ type: String }],
  },
  { _id: false }
);

const seoSchema = new mongoose.Schema(
  {
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    metaKeywords: { type: String, default: '' },
    gaId: { type: String, default: '' },
  },
  { _id: false }
);

const settingsSchema = new mongoose.Schema(
  {
    storeEmail: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    currency: { type: String, default: 'USD' },
    timezone: { type: String, default: 'UTC' },
    language: { type: String, default: 'en' },
    seo: { type: seoSchema, default: () => ({}) },
  },
  { _id: false }
);

const DEFAULT_SECTIONS = [
  { key: 'hero', enabled: true, order: 0 },
  { key: 'featuredProducts', enabled: true, order: 1 },
  { key: 'categories', enabled: true, order: 2 },
  { key: 'promoBanner', enabled: true, order: 3 },
  { key: 'latestProducts', enabled: true, order: 4 },
  { key: 'testimonials', enabled: true, order: 5 },
  { key: 'newsletter', enabled: true, order: 6 },
];

const websiteSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: 'My Store' },
    logo: { type: String, default: '' },
    hero: { type: heroSchema, default: () => ({}) },
    about: { type: String, default: '' },
    footer: { type: footerSchema, default: () => ({}) },
    contact: { type: contactSchema, default: () => ({}) },
    social: { type: socialSchema, default: () => ({}) },
    testimonials: [testimonialSchema],
    homepageSections: { type: [sectionSchema], default: DEFAULT_SECTIONS },
    appearance: { type: appearanceSchema, default: () => ({}) },
    settings: { type: settingsSchema, default: () => ({}) },
  },
  { timestamps: true }
);

websiteSchema.statics.getSingleton = async function getSingleton() {
  // Atomic upsert instead of check-then-create: concurrent first requests
  // (e.g. two admins loading the dashboard at the exact same moment before
  // any Website doc exists) would otherwise race and create two documents,
  // silently splitting reads/writes between them.
  return this.findOneAndUpdate(
    {},
    { $setOnInsert: {} },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

export default mongoose.model('Website', websiteSchema);
