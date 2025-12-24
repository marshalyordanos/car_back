import 'dotenv/config';
import { S3Client } from '@aws-sdk/client-s3';

const { DO_SPACES_KEY, DO_SPACES_SECRET } = process.env;

if (!DO_SPACES_KEY || !DO_SPACES_SECRET) {
  throw new Error('DigitalOcean Spaces credentials are missing');
}

export const spacesClient = new S3Client({
  endpoint: 'https://sfo3.digitaloceanspaces.com',
  region: 'sfo3',
  forcePathStyle: true,
  credentials: {
    accessKeyId: DO_SPACES_KEY,
    secretAccessKey: DO_SPACES_SECRET,
  },
});
