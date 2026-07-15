import express from 'express';
import Product from '../models/Product.js';
import Page from '../models/Page.js';

const router = express.Router();

router.get('/robots.txt', (req, res) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  res.type('text/plain').send(
    `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /account\n\nSitemap: ${clientUrl}/sitemap.xml\n`
  );
});

router.get('/sitemap.xml', async (req, res) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  const [products, pages] = await Promise.all([
    Product.find({ published: true, archived: false }).select('slug updatedAt'),
    Page.find().select('slug updatedAt'),
  ]);

  const staticUrls = ['/', '/products', '/categories', '/cart'];

  const urlEntries = [
    ...staticUrls.map((path) => `<url><loc>${clientUrl}${path}</loc></url>`),
    ...pages.map(
      (p) => `<url><loc>${clientUrl}/pages/${p.slug}</loc><lastmod>${p.updatedAt.toISOString()}</lastmod></url>`
    ),
    ...products.map(
      (p) =>
        `<url><loc>${clientUrl}/products/${p.slug}</loc><lastmod>${p.updatedAt.toISOString()}</lastmod></url>`
    ),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries.join(
    '\n'
  )}\n</urlset>`;

  res.type('application/xml').send(xml);
});

export default router;
