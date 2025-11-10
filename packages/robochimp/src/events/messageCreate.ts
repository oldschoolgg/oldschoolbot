
import { botReactHandler } from './messageCreate/botReactHandler.js';
import { grandExchangeHandler } from './messageCreate/grandExchangeHandler.js';
import { voteReactionHandler } from './messageCreate/voteReactionHandler.js';
import type { IMessage } from '@oldschoolgg/schemas';

async function tagHandler(msg: IMessage) {
	if (
		msg.content.startsWith('.') &&
		msg.content.length > 1 &&
		msg.content.length <= 33 &&
		!msg.content.includes(' ')
	) {
		const tag = await roboChimpClient.tag.findFirst({ where: { name: msg.content.replace('.', '') } });
		if (tag) {
			await globalClient.replyToMessage(msg, { content: tag.content, allowedMentions: { parse: [], users: [], roles: [] } });
		}
	}
}

const messageHandlers: ((msg: IMessage) => Promise<unknown>)[] = [
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
