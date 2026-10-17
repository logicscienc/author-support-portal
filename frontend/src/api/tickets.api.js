// src/api/tickets.api.js
import { apiRequest } from "./client";


export function fetchTickets(params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== "")
  ).toString();

  return apiRequest(`/tickets${query ? `?${query}` : ""}`);
}

export const fetchTicket = (id) => apiRequest(`/tickets/${id}`);


export const createTicket = (body) =>
  apiRequest("/tickets", { method: "POST", body });

// ---------- Admin only ----------


export const updateTicket = (id, body) =>
  apiRequest(`/tickets/${id}`, { method: "PATCH", body });

// Counts for the dashboard cards.
export const fetchTicketStats = () => apiRequest("/tickets/stats");


export const sendMessage = (id, body) =>
  apiRequest(`/tickets/${id}/messages`, { method: "POST", body });


export const addNote = (id, body) =>
  apiRequest(`/tickets/${id}/notes`, { method: "POST", body });

export const fetchDraft = (id) => apiRequest(`/tickets/${id}/draft`);

export const regenerateDraft = (id) =>
  apiRequest(`/tickets/${id}/draft/regenerate`, { method: "POST" });