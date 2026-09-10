// Storage seam: the rest of the app depends on this abstraction, not on where
// files actually live. Swapping the local-disk impl for Cloudinary/S3 in prod is
// a one-file change (bind a different provider in ContentModule).

export interface UploadedImage {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
  size: number;
}

export interface StoredFile {
  // Public path relative to the server root, e.g. "/uploads/abc.jpg".
  path: string;
}

export abstract class StorageService {
  abstract save(file: UploadedImage): Promise<StoredFile>;
}
