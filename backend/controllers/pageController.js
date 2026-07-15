import Page from '../models/Page.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const SYSTEM_PAGES = [
  { key: 'home', title: 'Home' },
  { key: 'about', title: 'About' },
  { key: 'contact', title: 'Contact' },
  { key: 'privacy-policy', title: 'Privacy Policy' },
  { key: 'terms-conditions', title: 'Terms & Conditions' },
  { key: 'faq', title: 'FAQ' },
  { key: 'return-policy', title: 'Return Policy' },
];

export const ensureSystemPages = async () => {
  for (const sp of SYSTEM_PAGES) {
    // eslint-disable-next-line no-await-in-loop
    await Page.findOneAndUpdate(
      { key: sp.key },
      { $setOnInsert: { ...sp, slug: sp.key, isSystem: true, content: '' } },
      { upsert: true, new: true }
    );
  }
};

export const getPages = asyncHandler(async (req, res) => {
  const pages = await Page.find().sort({ isSystem: -1, title: 1 });
  res.json({ success: true, pages });
});

export const getPageBySlug = asyncHandler(async (req, res) => {
  const page = await Page.findOne({ slug: req.params.slug });
  if (!page) {
    res.status(404);
    throw new Error('Page not found');
  }
  res.json({ success: true, page });
});

export const createPage = asyncHandler(async (req, res) => {
  const { title, content, metaTitle, metaDescription } = req.body;
  const page = await Page.create({
    key: `custom-${Date.now()}`,
    title,
    content,
    metaTitle,
    metaDescription,
  });
  res.status(201).json({ success: true, page });
});

export const updatePage = asyncHandler(async (req, res) => {
  const page = await Page.findById(req.params.id);
  if (!page) {
    res.status(404);
    throw new Error('Page not found');
  }
  const { title, content, metaTitle, metaDescription } = req.body;
  if (title) page.title = title;
  if (content !== undefined) page.content = content;
  if (metaTitle !== undefined) page.metaTitle = metaTitle;
  if (metaDescription !== undefined) page.metaDescription = metaDescription;
  await page.save();
  res.json({ success: true, page });
});

export const deletePage = asyncHandler(async (req, res) => {
  const page = await Page.findById(req.params.id);
  if (!page) {
    res.status(404);
    throw new Error('Page not found');
  }
  if (page.isSystem) {
    res.status(400);
    throw new Error('System pages cannot be deleted, only edited');
  }
  await page.deleteOne();
  res.json({ success: true, message: 'Page deleted' });
});
