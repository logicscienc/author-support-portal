
import * as ticketService from '../services/ticket.service.js';
import * as draftService from '../services/ai/draft.service.js';

export async function create(req, res) {
  const ticket = await ticketService.createTicket(req.user, req.valid.body);
  res.status(201).json({ data: ticket });
}

export async function list(req, res) {
  const { tickets, meta } = await ticketService.listTickets(req.user, req.valid.query);
  res.json({ data: tickets, meta });
}

export async function getOne(req, res) {
  const ticket = await ticketService.getTicket(req.user, req.valid.params.id);
  res.json({ data: ticket });
}

export async function update(req, res) {
  const ticket = await ticketService.updateTicket(req.user, req.valid.params.id, req.valid.body);
  res.json({ data: ticket });
}

export async function addMessage(req, res) {
  const message = await ticketService.addMessage(req.user, req.valid.params.id, req.valid.body);
  res.status(201).json({ data: message });
}

export async function addNote(req, res) {
  const note = await ticketService.addNote(req.user, req.valid.params.id, req.valid.body);
  res.status(201).json({ data: note });
}

export async function getDraft(req, res) {
  const result = await draftService.getDraft(req.valid.params.id);
  res.json({ data: result });
}

export async function regenerateDraft(req, res) {
  const result = await draftService.getDraft(req.valid.params.id, { regenerate: true });
  res.json({ data: result });
}

export async function stats(req, res) {
  const data = await ticketService.getTicketStats();
  res.json({ data });
}