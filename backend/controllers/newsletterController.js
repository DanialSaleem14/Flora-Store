import NewsletterSubscriber from '../models/NewsletterSubscriber.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const subscribe = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const existing = await NewsletterSubscriber.findOne({ email });
  if (existing) {
    return res.json({ success: true, message: 'You are already subscribed.' });
  }
  await NewsletterSubscriber.create({ email });
  res.status(201).json({ success: true, message: 'Subscribed successfully.' });
});
