import cloudinary from './cloudinary.config';

export async function uploadToCloudinary(
  file: Express.Multer.File,
  folder: string,
): Promise<string> {
  try {
    // Recreate Node.js Buffer if necessary
    const buffer = Buffer.isBuffer(file.buffer)
      ? file.buffer
      : Buffer.from((file.buffer as any).data);

    const dataUri = `data:${file.mimetype};base64,${buffer.toString('base64')}`;
    const result = await cloudinary.uploader.upload(dataUri, { folder });
    console.log('Cloudinary upload result:', result);
    return result.secure_url;
  } catch (err) {
    console.error('Cloudinary upload failed:', err);
    throw err;
  }
}
