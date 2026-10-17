
import { apiRequest } from "./client";

export const fetchBooks = () => apiRequest("/books");