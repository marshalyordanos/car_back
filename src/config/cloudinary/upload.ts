import { PutObjectCommand } from '@aws-sdk/client-s3';
import { spacesClient } from './spaces.config';
import { v4 as uuid } from 'uuid';

const BUCKET = 'wheellol'; // CHANGE THIS

export async function uploadToSpaces(
  file: Express.Multer.File,
  folder: string,
): Promise<string> {
  try {
    const buffer = Buffer.isBuffer(file.buffer)
      ? file.buffer
      : Buffer.from((file.buffer as any).data);

    const fileName = `${folder}/${uuid()}-${file.originalname}`;

    await spacesClient.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: fileName,
        Body: buffer,
        ACL: 'public-read',
        ContentType: file.mimetype,
      }),
    );

    // Public URL
    return `https://${BUCKET}.sfo3.digitaloceanspaces.com/${fileName}`;
  } catch (err) {
    console.error('Spaces upload failed:', err);
    throw err;
  }
}
