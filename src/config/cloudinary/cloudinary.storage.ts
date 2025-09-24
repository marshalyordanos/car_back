// src/cloudinary/cloudinary.storage.ts
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinary.config';

export const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'uploads', // folder name
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  } as any, // <-- TypeScript workaround
});
