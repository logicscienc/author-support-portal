
import { z } from 'zod';
import { TICKET_STATUSES, TICKET_CATEGORIES, TICKET_PRIORITIES } from '../constants.js';

export const ticketIdSchema = z.object({
  id: z.string().min(1),
});

export const createTicketSchema = z.object({
  bookId: z.string().min(1).nullish(), 
  subject: z.string().trim().min(5, 'Subject must be at least 5 characters').max(150),
  description: z
    .string()
    .trim()
    .min(10, 'Please describe the issue in at least 10 characters')
    .max(5000),
});


export const listTicketsQuerySchema = z.object({
  status: z.enum(['ALL', ...TICKET_STATUSES]).optional(),
  category: z.enum(TICKET_CATEGORIES).optional(),
  priority: z.enum(TICKET_PRIORITIES).optional(),
  assignedTo: z.enum(['me', 'unassigned']).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});


export const updateTicketSchema = z
  .object({
    status: z.enum(TICKET_STATUSES),
    category: z.enum(TICKET_CATEGORIES),
    priority: z.enum(TICKET_PRIORITIES),
    assignedTo: z.literal('me').nullable(),
  })
  .partial()
  .refine((body) => Object.keys(body).length > 0, {
    message: 'Send at least one field to update',
  });

// Admin: send a reply the author can see.
export const createMessageSchema = z.object({
  content: z.string().trim().min(1, 'Reply cannot be empty').max(5000),
  status: z.enum(TICKET_STATUSES).optional(),
  isAssisted: z.boolean().default(false), // true if the reply started from the AI draft
});

// Admin: private note the author can never see.
export const createNoteSchema = z.object({
  content: z.string().trim().min(1, 'Note cannot be empty').max(5000),
});