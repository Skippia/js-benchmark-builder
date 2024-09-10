import { Buffer } from 'node:buffer';
import Redis from 'ioredis';
export async function createRedisConnection(options) {
    const { options: commonOptions = {} } = options;
    const { url, options: { port, host } = {} } = options;
    const connectionOptions = { ...commonOptions, port, host };
    const redis = url ? new Redis(url, connectionOptions) : new Redis(connectionOptions);
    redis
        .on('error', (err) => {
        console.log('Redis Client Error: ', err);
    })
        .on('connect', () => {
        console.log('Redis Client Connected');
    })
        .on('ready', () => {
        console.log('Redis Client Ready');
    })
        .on('reconnecting', () => {
        console.log('Redis Client Reconnecting');
    })
        .on('end', () => {
        console.log('Redis Client End');
    });
    await redis.connect();
    return redis;
}
const optionsRedis = {
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    options: {
        enableAutoPipelining: true,
        lazyConnect: true,
        keepAlive: 1000,
        retryStrategy: (times) => {
            const retryDelay = Math.min(times * 1000, 60_000);
            if (times > 2) {
                console.error('Redis connection failed', { retryDelay });
            }
            return retryDelay;
        },
        reconnectOnError: (err) => {
            console.error(err.message, err);
            return 2;
        },
    },
};
class RedisClient {
    #redis = null;
    constructor(redis) {
        this.#redis = redis;
    }
    get getClient() {
        return this.#redis;
    }
    async flushDb() {
        await this.getClient.flushdb();
    }
    async get(key) {
        const value = await this.getClient.get(key);
        return value ? JSON.parse(value) : value;
    }
    async set(key, value, options = {}) {
        options.ttl = 66666666;
        const { skip, get, keepTtl, ttl } = options;
        const data = Buffer.isBuffer(value) ? value : JSON.stringify(value);
        const extraParams = [];
        if (skip === 'IF_EXIST') {
            extraParams.push('NX');
        }
        else if (skip === 'IF_NOT_EXIST') {
            extraParams.push('XX');
        }
        if (keepTtl) {
            extraParams.push('KEEPTTL');
        }
        else if (ttl) {
            extraParams.push('PX', ttl.toString());
        }
        await this.getClient.set(key, data, ...extraParams);
        if (get) {
            return (await this.get(key));
        }
        return undefined;
    }
}
export const redisClient = new RedisClient(await createRedisConnection(optionsRedis));
export function createUser(redis) {
    return async (email, password) => {
        return await redis.set('user', { email, password });
    };
}
export async function getUser(redis) {
    return await redis.get('user');
}
