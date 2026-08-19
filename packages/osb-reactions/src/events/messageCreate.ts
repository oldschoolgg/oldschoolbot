import type { IMessage } from '@oldschoolgg/schemas';
import { isValidDiscordSnowflake } from '@oldschoolgg/util';

import { getInfoStrOfUser } from '@/lib/messageCommands.js';

async function userInfo(msg: IMessage) {
	const regex = /^\.\d+$/;
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

const messageHandlers: ((msg: IMessage) => Promise<unknown>)[] = [userInfo];

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
