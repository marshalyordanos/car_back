// import { PutObjectCommand } from '@aws-sdk/client-s3';
// import { spacesClient } from './spaces.config';
// import { v4 as uuid } from 'uuid';

// const BUCKET = 'wheellol'; // CHANGE THIS

// export async function uploadToSpaces(
//   file: Express.Multer.File,
//   folder: string,
// ): Promise<string> {
//   try {
//     const buffer = Buffer.isBuffer(file.buffer)
//       ? file.buffer
//       : Buffer.from((file.buffer as any).data);

//     const fileName = `${folder}/${uuid()}-${file.originalname}`;

//     await spacesClient.send(
//       new PutObjectCommand({
//         Bucket: BUCKET,
//         Key: fileName,
//         Body: buffer,
//         ACL: 'public-read',
//         ContentType: file.mimetype,
//       }),
//     );

//     // Public URL
//     return `https://${BUCKET}.sfo3.digitaloceanspaces.com/${fileName}`;
//   } catch (err) {
//     console.error('Spaces upload failed:', err);
//     throw err;
//   }
// }
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { spacesClient } from './spaces.config';
import { v4 as uuid } from 'uuid';
import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';
import { RpcException } from '@nestjs/microservices';

const BUCKET = 'wheellol';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function kb(bytes: number) {
  return (bytes / 1024).toFixed(2) + ' KB';
}

function mb(bytes: number) {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

export async function uploadToSpaces(
  file: Express.Multer.File,
  folder: string,
): Promise<string> {
  try {
    let buffer = Buffer.isBuffer(file.buffer)
      ? file.buffer
      : Buffer.from((file.buffer as any).data);

    /* -------- FILE SIZE VALIDATION -------- */
    if (buffer.length > MAX_FILE_SIZE) {
      console.error('Upload rejected file too large:', {
        file: file.originalname,
        size: mb(buffer.length),
      });

      throw new RpcException(
        'File is too large maximum allowed size is 10MB per file',
      );
    }

    const beforeSize = buffer.length;

    /* -------- IMAGE COMPRESSION -------- */
    if (file.mimetype.startsWith('image/')) {
      buffer = await sharp(buffer).rotate().jpeg({ quality: 70 }).toBuffer();
    }

    /* -------- PDF COMPRESSION -------- */
    if (file.mimetype === 'application/pdf') {
      const pdfDoc = await PDFDocument.load(buffer);
      pdfDoc.setProducer('Compressed');
      pdfDoc.setCreator('Compressed');

      buffer = Buffer.from(await pdfDoc.save({ useObjectStreams: true }));
    }

    const afterSize = buffer.length;

    console.log('File compression result:', {
      file: file.originalname,
      type: file.mimetype,
      before: kb(beforeSize),
      after: kb(afterSize),
      saved: kb(beforeSize - afterSize),
    });

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

    return `https://${BUCKET}.sfo3.digitaloceanspaces.com/${fileName}`;
  } catch (err) {
    console.error('Spaces upload failed:', err);
    throw err;
  }
}
