import express from 'express';
import { body } from 'express-validator';
import { subscribe } from '../controllers/newsletterController.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.post('/subscribe', [body('email').isEmail().withMessage('A valid email is required')], validate, subscribe);

export default router;
