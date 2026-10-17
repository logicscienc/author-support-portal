
import * as bookService from '../services/book.service.js';

export async function list(req, res) {
  const books = await bookService.listBooks(req.user);
  res.json({ data: books });
}