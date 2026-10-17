
import 'dotenv/config';
import { readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { v2 as cloudinary } from 'cloudinary';

const IMAGES_DIR = fileURLToPath(new URL('../../images/', import.meta.url));
const OUTPUT_FILE = fileURLToPath(new URL('../data/book_covers.json', import.meta.url));

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error('Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to your .env first.');
  process.exit(1);
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

const files = (await readdir(IMAGES_DIR)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
if (files.length === 0) {
  console.error(`No images found in ${IMAGES_DIR}`);
  process.exit(1);
}

const covers = {};

for (const file of files) {
  const bookId = path.parse(file).name.toUpperCase(); 

  if (!/^BK\d+$/.test(bookId)) {
    console.warn(`Skipping "${file}": rename it to a book id like BK001.jpg`);
    continue;
  }

  try {
    const result = await cloudinary.uploader.upload(path.join(IMAGES_DIR, file), {
      folder: 'bookleaf-covers',
      public_id: bookId,
      overwrite: true, 
    });

    
    covers[bookId] = result.secure_url.replace('/upload/', '/upload/w_400,c_limit,q_auto,f_auto/');
    console.log(`Uploaded ${file} -> ${bookId}`);
  } catch (err) {
    console.error(`Failed to upload ${file}: ${err.message}`);
  }
}

await writeFile(OUTPUT_FILE, `${JSON.stringify(covers, null, 2)}\n`);
console.log(`\nSaved ${Object.keys(covers).length} cover URLs to data/book_covers.json`);