import Redis, { type RedisOptions } from 'ioredis';
import { z } from 'zod';

const patronTierChangeMessageSchema = z.object({
	type: z.literal('patron_tier_change'),
	new_tier: z.number().int(),
	old_tier: z.number().int(),
	discord_ids: z.array(z.string()),
	first_time_patron: z.boolean()
});

const pingMessageSchema = z.object({
	type: z.literal('ping')
});

const messageSchema = z.union([pingMessageSchema, patronTierChangeMessageSchema]);

type Message = z.infer<typeof messageSchema>;

const CHANNEL_ID = 'main';
export class TSRedis {
	private redis: Redis;
	public isMocked: boolean;

	constructor(options: RedisOptions & { mocked: boolean } = { mocked: false }) {
		this.redis = options.mocked ? (null as any) : new Redis(options);
		this.isMocked = options.mocked;
	}

	disconnect() {
		if (this.isMocked) return Promise.resolve();
		return this.redis.disconnect(false);
	}

	subscribe(callback: (message: Message) => void) {
		if (this.isMocked) return Promise.resolve();
		this.redis.subscribe(CHANNEL_ID, err => {
			if (err) {
				console.error('Failed to subscribe: ', err);
			}
		});

		this.redis.on('message', (receivedChannel, message) => {
			if (receivedChannel === CHANNEL_ID) {
				try {
					const parsedMessage = JSON.parse(message);
					const validatedMessage = messageSchema.parse(parsedMessage);
					callback(validatedMessage);
				} catch (error) {
					console.error('Failed to parse message: ', error);
				}
			}
		});
	}

	publish(message: Message) {
		if (this.isMocked) return Promise.resolve();
		const parsedMessage = messageSchema.parse(message);
		return this.redis.publish(CHANNEL_ID, JSON.stringify(parsedMessage));
	}
}
