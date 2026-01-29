import { CacheModuleOptions } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

export const redisConfig = async (): Promise<CacheModuleOptions> => ({
  // @ts-ignore
  store: await redisStore({
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    },
    ttl: 600, // 10 minutos padrão
  }),
});
