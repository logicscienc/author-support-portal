
import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { loginSchema } from '../validators/auth.validator.js';
import { loginLimiter } from '../middleware/rateLimit.js';
import * as authController from '../controllers/auth.controller.js';

const router = Router();

router.post('/login', loginLimiter, validate({ body: loginSchema }), authController.login);
router.get('/me', authenticate, authController.me);

export default router;