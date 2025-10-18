import { Provider } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

export const redisProvider: Provider = {
  provide: REDIS_CLIENT,
  useFactory: () => {
    const client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    client.on('error', (err) => console.error('Redis error:', err));
    return client;
  },
};
