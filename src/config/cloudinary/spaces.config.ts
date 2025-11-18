import { S3Client } from '@aws-sdk/client-s3';

export const spacesClient = new S3Client({
  endpoint: 'https://sfo3.digitaloceanspaces.com',
  region: 'sfo3',
  forcePathStyle: false,
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY || '',
    secretAccessKey: process.env.DO_SPACES_SECRET || '',
  },
});
