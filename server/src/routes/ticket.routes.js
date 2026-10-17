
import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { requireRole } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimit.js';
import {
  ticketIdSchema,
  createTicketSchema,
  listTicketsQuerySchema,
  updateTicketSchema,
  createMessageSchema,
  createNoteSchema,
} from '../validators/ticket.validator.js';
import * as ticketController from '../controllers/ticket.controller.js';

const router = Router();

router.get('/', validate({ query: listTicketsQuerySchema }), ticketController.list);
router.get('/stats', requireRole('ADMIN'), ticketController.stats);
router.get('/:id', validate({ params: ticketIdSchema }), ticketController.getOne);

// Authors only
router.post('/', requireRole('AUTHOR'), validate({ body: createTicketSchema }), ticketController.create);

// Admins only
router.patch(
  '/:id',
  requireRole('ADMIN'),
  validate({ params: ticketIdSchema, body: updateTicketSchema }),
  ticketController.update,
);
router.post(
  '/:id/messages',
  requireRole('ADMIN'),
  validate({ params: ticketIdSchema, body: createMessageSchema }),
  ticketController.addMessage,
);
router.post(
  '/:id/notes',
  requireRole('ADMIN'),
  validate({ params: ticketIdSchema, body: createNoteSchema }),
  ticketController.addNote,
);

router.get('/:id/draft', requireRole('ADMIN'), aiLimiter, validate({ params: ticketIdSchema }), ticketController.getDraft);
router.post('/:id/draft/regenerate', requireRole('ADMIN'), aiLimiter, validate({ params: ticketIdSchema }), ticketController.regenerateDraft);

export default router;