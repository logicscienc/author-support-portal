
import { prisma } from '../lib/prisma.js';


const toNumber = (value) => (value === null ? null : Number(value));

function formatBook(book) {
  return {
    id: book.id,
    title: book.title,
    isbn: book.isbn,
    genre: book.genre,
    publicationDate: book.publicationDate, 
    status: book.status,
    mrp: toNumber(book.mrp),              
    copiesSold: book.copiesSold,
    totalRoyalty: toNumber(book.totalRoyalty),
    royaltyPaid: toNumber(book.royaltyPaid),
    royaltyPending: toNumber(book.royaltyPending),
    royaltyPerCopy: toNumber(book.royaltyPerCopy),
    lastPayoutDate: book.lastPayoutDate,
    printPartner: book.printPartner,
    coverImageUrl: book.coverImageUrl,
    availableOn: book.availableOn,
    ...(book.author && { author: { id: book.author.id, name: book.author.name } }),
  };
}


export async function listBooks(user) {
  const isAdmin = user.role === 'ADMIN';

  const books = await prisma.book.findMany({
    where: isAdmin ? {} : { authorId: user.id },
    include: isAdmin ? { author: { select: { id: true, name: true } } } : undefined,
    orderBy: [{ publicationDate: { sort: 'desc', nulls: 'last' } }, { title: 'asc' }],
  });

  return books.map(formatBook);
}