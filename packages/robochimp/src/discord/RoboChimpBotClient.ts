import { type APIApplication, type APIUser, DiscordClient, type DiscordClientOptions } from '@oldschoolgg/discord';
import { RedisKeys } from '@oldschoolgg/util';
import type { DiscordUser } from '@prisma/robochimp';
import { DiscordSnowflake } from '@sapphire/snowflake';

import { mentionCommand } from '@/discord/utils.js';
import { allCommands } from '@/commands/allCommands.js';
import { redis } from '@/lib/redis.js';
import { RUser } from '@/structures/RUser.js';

// @ts-expect-error ignore
BigInt.prototype.toJSON = function () {
	return this.toString();
};

export class RoboChimpBotClient extends DiscordClient {
	public isShuttingDown = false;
	public allCommands = allCommands;

	constructor(options: DiscordClientOptions) {
		super(options);
		this.on('ready', async e => {
			await this.handleReadyEvent(e);
		});
	}

	async upsertDiscordUser(user: APIUser) {
		const data: DiscordUser = {
			id: user.id,
			username: user.username,
			global_name: user.global_name,
			avatar: user.avatar,
			created_at: new Date(DiscordSnowflake.timestampFrom(user.id))
		} as const;
		await roboChimpClient.discordUser
			.upsert({
				where: {
					id: user.id
				},
				create: data,
				update: data
			})
			.catch(console.error);
		return data;
	}

	async fetchRUser(_id: bigint | string): Promise<RUser> {
		const id: bigint = typeof _id === 'string' ? BigInt(_id) : _id;
		const user = await roboChimpClient.user.upsert({
			where: {
				id: id
			},
			create: {
				id
			},
			update: {}
		});
		redis.set(RedisKeys.RoboChimpUser(user.id), JSON.stringify(user));
		return new RUser(user);
	}

	mentionCommand(name: string, subCommand?: string, subSubCommand?: string) {
		return mentionCommand(name, subCommand, subSubCommand);
	}

	async handleReadyEvent({ application }: { application: APIApplication }) {
		console.log(`Logged in as ${application.bot?.username} after ${process.uptime()}s`);
	}
}
