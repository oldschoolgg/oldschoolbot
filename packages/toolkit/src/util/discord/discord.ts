import {
	type ButtonBuilder,
	type ButtonInteraction,
	type CacheType,
	type Collection,
	type CollectorFilter,
	ComponentType,
	type Guild,
	type InteractionReplyOptions,
	type Message,
	PermissionsBitField,
	type SelectMenuInteraction
} from '@oldschoolgg/discord.js';

import { chunk } from '../array.js';
import { stripEmojis } from '../misc.js';

const discordEpoch = 1_420_070_400_000;

export function randomSnowflake(): string {
	const timestamp = Date.now() - discordEpoch;
	const workerId = Math.floor(Math.random() * 32);
	const processId = Math.floor(Math.random() * 32);
	const increment = Math.floor(Math.random() * 4096);

	const timestampPart = BigInt(timestamp) << 22n;
	const workerIdPart = BigInt(workerId) << 17n;
	const processIdPart = BigInt(processId) << 12n;
	const incrementPart = BigInt(increment);

	const snowflakeBigInt = timestampPart | workerIdPart | processIdPart | incrementPart;

	return snowflakeBigInt.toString();
}

export async function hasBanMemberPerms(userID: string, guild: Guild) {
	const member = await guild.members.fetch(userID).catch(() => null);
	if (!member) return false;
	return member.permissions.has(PermissionsBitField.Flags.BanMembers);
}

export function isValidDiscordSnowflake(snowflake: string): boolean {
	return /^\d{17,19}$/.test(snowflake);
}

export function makeComponents(components: ButtonBuilder[]): InteractionReplyOptions['components'] {
	return chunk(components, 5).map(i => ({ components: i, type: ComponentType.ActionRow }));
}

export function cleanUsername(username: string) {
	return stripEmojis(username).replace(/[@|*]/g, '').substring(0, 32);
}

export function awaitMessageComponentInteraction({
	message,
	filter,
	time
}: {
	time: number;
	message: Message;
	filter: CollectorFilter<
		[
			ButtonInteraction<CacheType> | SelectMenuInteraction<CacheType>,
			Collection<string, ButtonInteraction<CacheType> | SelectMenuInteraction>
		]
	>;
}): Promise<SelectMenuInteraction<CacheType> | ButtonInteraction<CacheType>> {
	return new Promise((resolve, reject) => {
		const collector = message.createMessageComponentCollector<ComponentType.Button>({ max: 1, filter, time });
		collector.once('end', (interactions, reason) => {
			const interaction = interactions.first();
			if (interaction) resolve(interaction);
			else reject(new Error(reason));
		});
	});
}
