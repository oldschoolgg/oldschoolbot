import type { IMessage } from '@oldschoolgg/schemas';
import { isValidDiscordSnowflake } from '@oldschoolgg/util';

import { getInfoStrOfUser } from '@/lib/messageCommands.js';
import { botReactHandler } from './messageCreate/botReactHandler.js';
import { grandExchangeHandler } from './messageCreate/grandExchangeHandler.js';
import { voteReactionHandler } from './messageCreate/voteReactionHandler.js';

async function tagHandler(msg: IMessage): Promise<void> {
	if (
		msg.content.startsWith('.') &&
		msg.content.length > 1 &&
		msg.content.length <= 33 &&
		!msg.content.includes(' ')
	) {
		const tag = await roboChimpClient.tag.findFirst({ where: { name: msg.content.replace('.', '') } });
		if (tag) {
			await globalClient.replyToMessage(msg, {
				content: tag.content,
				allowedMentions: { parse: [], users: [], roles: [] }
			});
		}
	}
}

async function userInfo(msg: IMessage) {
	const regex = /^\.\d+%/;
	if (!regex.test(msg.content)) return;
	const user = await globalClient.fetchRUser(msg.author_id);
	if (!user) return;

	const possibleID = msg.content.replace('.', '');

	if (possibleID !== user.id.toString() && !user.isSupport()) return;

	if (msg.guild_id && possibleID && isValidDiscordSnowflake(possibleID)) {
		const target = await globalClient.fetchRUser(possibleID).catch(() => null);
		if (!target) return;
		const info = await getInfoStrOfUser(target);
		await globalClient.replyToMessage(msg, {
			content: info,
			allowedMentions: { parse: [], users: [], roles: [] }
		});
	}
}

const messageHandlers: ((msg: IMessage) => Promise<unknown>)[] = [
	userInfo,
	botReactHandler,
	grandExchangeHandler,
	voteReactionHandler,
	tagHandler
];

export async function handleMessageCreate(msg: IMessage) {
	if (!msg.guild_id) return;

	for (const handler of messageHandlers) {
		try {
			await handler(msg);
		} catch (e) {
			console.error('Error in message handler:', e);
		}
	}
}
