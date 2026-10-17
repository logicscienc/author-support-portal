
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../utils/AppError.js';
import { royaltyCalendar } from '../../utils/dates.js';
import { chat, isLlmAvailable } from './llmClient.js';
import { triageTicket } from './triage.service.js';
import { getKnowledge, CATEGORY_LABELS } from './knowledgeBase.js';
import { buildDraftSystem, buildDraftUser } from './prompts.js';

const loadTicket = (id) =>
  prisma.ticket.findUnique({
    where: { id },
    include: {
      author: { select: { name: true } },
      book: true,
      messages: { orderBy: { createdAt: 'desc' }, take: 3, select: { content: true } }, 
    },
  });


const unavailable = () => ({
  draft: null,
  available: false,
  cached: false,
  generatedAt: null,
  reason: 'AI drafting is unavailable right now. You can write the reply manually.',
});

export async function getDraft(ticketId, { regenerate = false } = {}) {
  let ticket = await loadTicket(ticketId);
  if (!ticket) throw new AppError(404, 'Ticket not found', 'NOT_FOUND');

  
  if (ticket.aiStatus === 'PENDING') {
    await triageTicket(ticketId);
    ticket = await loadTicket(ticketId);
  }

  
  if (ticket.aiDraft && !regenerate) {
    return { draft: ticket.aiDraft, available: true, cached: true, generatedAt: ticket.aiDraftUpdatedAt };
  }

  if (!isLlmAvailable()) return unavailable();

  const otherBooks = ticket.book
    ? []
    : await prisma.book.findMany({ where: { authorId: ticket.authorId }, take: 10, orderBy: { title: 'asc' } });

  try {
    const { text, usage } = await chat({
      system: buildDraftSystem(getKnowledge(ticket.category)), 
      user: buildDraftUser({
        firstName: ticket.author.name.split(' ')[0],
        categoryLabel: CATEGORY_LABELS[ticket.category],
        ticket,
        book: ticket.book,
        otherBooks,
        calendar: ticket.category === 'ROYALTY_PAYMENTS' ? royaltyCalendar() : null,
        previousReplies: ticket.messages.map((m) => m.content).reverse(),
      }),
      maxTokens: 450,
      temperature: 0.2,
    });

    if (!text) throw new Error('Model returned an empty draft');

    const saved = await prisma.ticket.update({
      where: { id: ticketId },
      data: { aiDraft: text, aiDraftUpdatedAt: new Date() },
      select: { aiDraftUpdatedAt: true },
    });

    console.log(`[ai] draft ticket=${ticketId} tokens=${usage.promptTokens}+${usage.completionTokens}`);
    return { draft: text, available: true, cached: false, generatedAt: saved.aiDraftUpdatedAt };
  } catch (err) {
    console.warn(`[ai] draft failed for ticket ${ticketId}: ${err.message}`);
    return unavailable();
  }
}