
import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });


const AUTHOR_PASSWORD = 'Author@123';
const ADMIN = { name: 'BookLeaf Support', email: 'admin@bookleaf.test', password: 'Admin@123' };


const STATUS_MAP = {
  'Published & Live': 'PUBLISHED',
  'In Production - Cover Design': 'COVER_DESIGN',
  'In Production - Typesetting': 'TYPESETTING',
};

const toDate = (value) => (value ? new Date(value) : null);

function mapStatus(raw) {
  const status = STATUS_MAP[raw];
  if (!status) {
    throw new Error(`Unknown book status "${raw}" in the dataset. Add it to STATUS_MAP.`);
  }
  return status;
}

async function main() {
  const file = new URL('../data/bookleaf_sample_data.json', import.meta.url);
  const { authors } = JSON.parse(await readFile(file, 'utf8'));

    let covers = {};
  try {
    covers = JSON.parse(await readFile(new URL('../data/book_covers.json', import.meta.url), 'utf8'));
  } catch {
    
  }

  const authorHash = await bcrypt.hash(AUTHOR_PASSWORD, 10);
  const adminHash = await bcrypt.hash(ADMIN.password, 10);

  // 1. Admin user 
  await prisma.user.upsert({
    where: { email: ADMIN.email },
    update: { name: ADMIN.name, passwordHash: adminHash, role: 'ADMIN' },
    create: { name: ADMIN.name, email: ADMIN.email, passwordHash: adminHash, role: 'ADMIN' },
  });

  // 2. Authors and their books
  let bookCount = 0;
  for (const a of authors) {
    const userData = {
      name: a.name,
      email: a.email.toLowerCase(),
      phone: a.phone ?? null,
      city: a.city ?? null,
      joinedAt: toDate(a.joined_date),
      externalId: a.author_id,
    };

    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: userData,
      create: { ...userData, passwordHash: authorHash, role: 'AUTHOR' },
    });

    for (const b of a.books ?? []) {
      const bookData = {
        title: b.title,
        isbn: b.isbn ?? null,
        genre: b.genre ?? null,
        publicationDate: toDate(b.publication_date), 
        status: mapStatus(b.status),
        mrp: b.mrp ?? null,        
        copiesSold: b.total_copies_sold ?? 0,
        totalRoyalty: b.total_royalty_earned ?? 0,
        royaltyPaid: b.royalty_paid ?? 0,
        royaltyPending: b.royalty_pending ?? 0,
        royaltyPerCopy: b.author_royalty_per_copy ?? null,
        lastPayoutDate: toDate(b.last_royalty_payout_date),
        printPartner: b.print_partner ?? null,
        availableOn: b.available_on ?? [],
        authorId: user.id,
         ...(covers[b.book_id] && { coverImageUrl: covers[b.book_id] }),
      };

      await prisma.book.upsert({
        where: { externalId: b.book_id },
        update: bookData,
        create: { ...bookData, externalId: b.book_id },
      });
      bookCount += 1;
    }
  }

  console.log(`Seeded ${authors.length} authors and ${bookCount} books.`);
  console.log(`Admin login:  ${ADMIN.email} / ${ADMIN.password}`);
  console.log(`Author login: <any author email from the dataset> / ${AUTHOR_PASSWORD}`);
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());