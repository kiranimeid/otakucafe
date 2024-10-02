import Redis, { type RedisKey } from 'ioredis';

let isInitialized = false;

let redisInstance: Redis | null = null;
const redis = async () => {
	const instance = new Redis({
		host: process.env.REDIS_HOST || 'localhost',
		port: Number(process.env.REDIS_PORT) || 6379,
		password: process.env.REDIS_PASSWORD || '',
		username: process.env.REDIS_USERNAME || '',
		db: Number(process.env.REDIS_DB) || 0,
	});
	if (instance) {
		redisInstance = instance;
	}
};

export const get = async <T>(key: RedisKey): Promise<T | null> => {
	if (!isInitialized) {
		await redis();
		isInitialized = true;
	}
	if (!redisInstance) return null;
	return (await redisInstance.get(key)) as T | null;
};

export const set = async (
	key: RedisKey,
	value: string,
	exp: number = 3600
): Promise<void> => {
	if (!isInitialized) {
		await redis();
		isInitialized = true;
	}
	if (!redisInstance) return;
	await redisInstance?.set(key, value, 'EX', exp);
};

export default {
	get,
	set,
};
