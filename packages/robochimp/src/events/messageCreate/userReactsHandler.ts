import type { Message } from 'discord.js';

import { globalConfig } from '../../constants.js';

export async function userReactsHandler(msg: Message) {
	if (msg.guild?.id !== globalConfig.supportServerID) return;
	const mentioned = msg.mentions.users.first();
	if (mentioned) {
		const userID = BigInt(mentioned.id);
		const roboUser = await roboChimpClient.user.findFirst({
			where: {
				id: userID,
				react_emoji_id: {
					not: null
				}
			},
			select: {
				react_emoji_id: true
			}
		});
		if (roboUser && roboUser.react_emoji_id !== null) {
			try {
				await msg.react(roboUser.react_emoji_id);
			} catch (_) {}
		}
	}
}
