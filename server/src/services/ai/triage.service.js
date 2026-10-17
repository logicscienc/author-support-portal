
import { prisma } from '../../lib/prisma.js';
import { TICKET_CATEGORIES, TICKET_PRIORITIES } from '../../constants.js';
import { chat, isLlmAvailable } from './llmClient.js';
import { CLASSIFY_SYSTEM, buildClassifyUser } from './prompts.js';
import { keywordTriage } from './fallback.js';


async function classify(ticket) {
  if (isLlmAvailable()) {
    try {
      const { text, usage } = await chat({
        system: CLASSIFY_SYSTEM,
        user: buildClassifyUser(ticket),
        json: true,
        maxTokens: 120,
        temperature: 0,
      });

      const result = JSON.parse(text);
      if (!TICKET_CATEGORIES.includes(result.category) || !TICKET_PRIORITIES.includes(result.priority)) {
        throw new Error('Model returned a value outside the allowed lists');
      }

      console.log(`[ai] triage ticket=${ticket.id} tokens=${usage.promptTokens}+${usage.completionTokens}`);
      return {
        category: result.category,
        priority: result.priority,
        reason: String(result.reason ?? '').slice(0, 300),
        aiStatus: 'DONE',
      };
    } catch (err) {
      console.warn(`[ai] triage failed for ticket ${ticket.id}, using keyword rules: ${err.message}`);
    }
  }

  return { ...keywordTriage(ticket), aiStatus: 'FALLBACK' };
}

export async function triageTicket(ticketId) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: {
      id: true,
      subject: true,
      description: true,
      category: true,
      priority: true,
      aiStatus: true,
      book: { select: { title: true, status: true } },
    },
  });

 
  if (!ticket || ticket.aiStatus !== 'PENDING') return;

  const result = await classify(ticket);

  const aiFields = {
    aiCategory: result.category,
    aiPriority: result.priority,
    aiReason: result.reason,
    aiStatus: result.aiStatus,
  };

 
  const { count } = await prisma.ticket.updateMany({
    where: { id: ticketId, category: ticket.category, priority: ticket.priority },
    data: { ...aiFields, category: result.category, priority: result.priority },
  });

  if (count === 0) {
    await prisma.ticket.update({ where: { id: ticketId }, data: aiFields });
  }
}