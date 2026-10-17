
import { FiGrid, FiBook, FiMessageSquare, FiInbox } from "react-icons/fi";

export const authorLinks = [
  { to: "/author/dashboard", label: "Dashboard", icon: FiGrid },
  { to: "/author/books", label: "My Books", icon: FiBook },
  { to: "/author/tickets", label: "Support Tickets", icon: FiMessageSquare },
];

export const adminLinks = [
  { to: "/admin/dashboard", label: "Ticket Queue", icon: FiInbox },
];

export const homePathFor = (role) =>
  role === "ADMIN" ? "/admin/dashboard" : "/author/dashboard";