
import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/AppError.js';
import { triageTicket } from './ai/triage.service.js';

const DAY_MS = 86_400_000;


const baseInclude = {
  book: { select: { id: true, title: true } },
  author: { select: { id: true, name: true } },
  assignedTo: { select: { id: true, name: true } },
  _count: { select: { messages: true } },
};


function formatTicket(ticket, role) {
  const base = {
    id: ticket.id,
    subject: ticket.subject,
    description: ticket.description,
    status: ticket.status,
    book: ticket.book,
    replyCount: ticket._count.messages,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
  };

  if (role !== 'ADMIN') return base;

  return {
    ...base,
    author: ticket.author,
    category: ticket.category,
    priority: ticket.priority,
    aiCategory: ticket.aiCategory,
    aiPriority: ticket.aiPriority,
    aiReason: ticket.aiReason,
    aiStatus: ticket.aiStatus,
    assignedTo: ticket.assignedTo,
  };
}


function statusFields(status) {
  if (status === 'RESOLVED') return { status, resolvedAt: new Date() };
  if (status === 'CLOSED') return { status, closedAt: new Date() };
  return { status, resolvedAt: null, closedAt: null }; // reopened
}


function statusFilter(isAdmin, status) {
  if (status && status !== 'ALL') return { status };
  if (!status && isAdmin) return { status: { in: ['OPEN', 'IN_PROGRESS'] } };
  return {};
}

async function assertTicketExists(id) {
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    select: { id: true, status: true, assignedToId: true },
  });
  if (!ticket) throw new AppError(404, 'Ticket not found', 'NOT_FOUND');
  return ticket;
}

export async function createTicket(user, { bookId, subject, description }) {
 
  if (bookId) {
    const book = await prisma.book.findFirst({ where: { id: bookId, authorId: user.id } });
    if (!book) {
      throw new AppError(400, 'That book was not found on your account', 'INVALID_BOOK');
    }
  }

  const ticket = await prisma.ticket.create({
    data: { subject, description, authorId: user.id, bookId: bookId ?? null },
    include: baseInclude,
  });

  
  triageTicket(ticket.id).catch((err) =>
    console.error(`[ai] triage crashed for ticket ${ticket.id}`, err),
  );

  return formatTicket(ticket, user.role);
}

export async function listTickets(user, filters) {
  const isAdmin = user.role === 'ADMIN';
  const { status, category, priority, assignedTo, from, to, page, limit } = filters;

  const where = {
    ...(!isAdmin && { authorId: user.id }), 
    ...statusFilter(isAdmin, status),
    ...(isAdmin && category && { category }),
    ...(isAdmin && priority && { priority }),
    ...(isAdmin && assignedTo === 'me' && { assignedToId: user.id }),
    ...(isAdmin && assignedTo === 'unassigned' && { assignedToId: null }),
    ...((from || to) && {
      createdAt: {
        ...(from && { gte: from }),
        ...(to && { lt: new Date(to.getTime() + DAY_MS) }), 
      },
    }),
  };

 
  const orderBy = isAdmin ? [{ priority: 'asc' }, { createdAt: 'asc' }] : [{ createdAt: 'desc' }];

  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      include: baseInclude,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.ticket.count({ where }),
  ]);

  return {
    tickets: tickets.map((t) => formatTicket(t, user.role)),
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getTicket(user, id) {
  const isAdmin = user.role === 'ADMIN';

  const ticket = await prisma.ticket.findFirst({
    where: { id, ...(!isAdmin && { authorId: user.id }) },
    include: {
      ...baseInclude,
      messages: {
        orderBy: { createdAt: 'asc' },
        include: { sender: { select: { name: true } } },
      },
      
      ...(isAdmin && {
        internalNotes: {
          orderBy: { createdAt: 'asc' },
          include: { author: { select: { name: true } } },
        },
      }),
    },
  });

  
  if (!ticket) {
    throw new AppError(404, 'Ticket not found', 'NOT_FOUND');
  }

  return {
    ...formatTicket(ticket, user.role),
    messages: ticket.messages.map((m) => ({
      id: m.id,
      content: m.content,
      from: m.sender.name,
      createdAt: m.createdAt,
    })),
    ...(isAdmin && {
      internalNotes: ticket.internalNotes.map((n) => ({
        id: n.id,
        content: n.content,
        from: n.author.name,
        createdAt: n.createdAt,
      })),
    }),
  };
}


export async function updateTicket(user, id, changes) {
  await assertTicketExists(id);

  const data = {};
  if (changes.status) Object.assign(data, statusFields(changes.status));
  if (changes.priority) data.priority = changes.priority;
  if (changes.category) {
    data.category = changes.category;
    // The saved AI draft was written for the old category, so throw it away.
    data.aiDraft = null;
    data.aiDraftUpdatedAt = null;
  }
  if (changes.assignedTo !== undefined) {
    data.assignedToId = changes.assignedTo === 'me' ? user.id : null;
  }

  await prisma.ticket.update({ where: { id }, data });
  return getTicket(user, id);
}


export async function addMessage(user, id, { content, status, isAssisted }) {
  const ticket = await assertTicketExists(id);

 
  const nextStatus = status ?? (ticket.status === 'OPEN' ? 'IN_PROGRESS' : ticket.status);

  const [message] = await prisma.$transaction([
    prisma.ticketMessage.create({
      data: { ticketId: id, senderId: user.id, content, isAssisted },
      include: { sender: { select: { name: true } } },
    }),
    prisma.ticket.update({
      where: { id },
      data: {
        ...statusFields(nextStatus),
        assignedToId: ticket.assignedToId ?? user.id, 
      },
    }),
  ]);

  return {
    id: message.id,
    content: message.content,
    from: message.sender.name,
    createdAt: message.createdAt,
    ticketStatus: nextStatus,
  };
}


export async function addNote(user, id, { content }) {
  await assertTicketExists(id);

  const note = await prisma.internalNote.create({
    data: { ticketId: id, authorId: user.id, content },
    include: { author: { select: { name: true } } },
  });

  return { id: note.id, content: note.content, from: note.author.name, createdAt: note.createdAt };
}


export async function getTicketStats() {
  const unresolved = { in: ['OPEN', 'IN_PROGRESS'] };

  const [byStatus, unassigned, critical] = await Promise.all([
    prisma.ticket.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.ticket.count({ where: { assignedToId: null, status: unresolved } }),
    prisma.ticket.count({ where: { priority: 'CRITICAL', status: unresolved } }),
  ]);

  const count = (status) => byStatus.find((row) => row.status === status)?._count._all ?? 0;

  return {
    total: byStatus.reduce((sum, row) => sum + row._count._all, 0),
    open: count('OPEN'),
    inProgress: count('IN_PROGRESS'),
    resolved: count('RESOLVED'),
    closed: count('CLOSED'),
    unassigned,
    critical,
  };
}