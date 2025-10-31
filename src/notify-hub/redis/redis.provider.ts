import { Provider } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

export const redisProvider: Provider = {
  provide: REDIS_CLIENT,
  useFactory: () => {
    const redisUrl = process.env.REDIS_URL;
    console.log('redis:profcide: ', redisUrl);

    if (!redisUrl) {
      throw new Error('REDIS_URL environment variable is not defined');
    }

    const client = new Redis(redisUrl);
    client.on('error', (err) => console.error('Redis error:', err));
    return client;
  },
};
