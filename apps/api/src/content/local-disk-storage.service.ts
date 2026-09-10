import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { StorageService, type StoredFile, type UploadedImage } from './storage.service';

const MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

// Writes uploaded images to a local "uploads" directory served statically.
// WARNING: ephemeral on free hosting (Render/Fly) — swap for a durable provider
// before production. See docs/features/06-content-administration RNF-06.3.
@Injectable()
export class LocalDiskStorageService extends StorageService {
  private readonly uploadDir = join(process.cwd(), 'uploads');

  async save(file: UploadedImage): Promise<StoredFile> {
    await mkdir(this.uploadDir, { recursive: true });
    const ext = extname(file.originalname) || MIME_EXTENSIONS[file.mimetype] || '';
    const filename = `${randomUUID()}${ext}`;
    await writeFile(join(this.uploadDir, filename), file.buffer);
    return { path: `/uploads/${filename}` };
  }
}
