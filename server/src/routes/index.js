
import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import authRoutes from './auth.routes.js';
import bookRoutes from './book.routes.js';
import ticketRoutes from './ticket.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/books', authenticate, bookRoutes);
router.use('/tickets', authenticate, ticketRoutes);

export default router;