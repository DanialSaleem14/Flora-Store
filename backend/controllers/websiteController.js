import Website from '../models/Website.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getWebsite = asyncHandler(async (req, res) => {
  const website = await Website.getSingleton();
  res.json({ success: true, website });
});

const DEEP_MERGE_KEYS = ['hero', 'footer', 'contact', 'social', 'appearance', 'settings'];

export const updateWebsite = asyncHandler(async (req, res) => {
  const website = await Website.getSingleton();
  const body = req.body;

  Object.keys(body).forEach((key) => {
    if (DEEP_MERGE_KEYS.includes(key) && typeof body[key] === 'object' && body[key] !== null) {
      website[key] = { ...website[key]?.toObject?.() ?? website[key], ...body[key] };
    } else {
      website[key] = body[key];
    }
  });

  await website.save();
  res.json({ success: true, website });
});
