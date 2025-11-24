import multer from 'multer';

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 50 MB per file
    files: 10, // max 10 files per request
  },
});
