import type { GatewayMessageCreateDispatchData } from '@oldschoolgg/discord';

import { globalConfig } from '@/constants.js';

function getMentionedOrRepliedUserId(msg: GatewayMessageCreateDispatchData): string | null {
	const mentioned = msg.mentions.find(user => user.id !== msg.author.id);
	if (mentioned) return mentioned.id;

	const referencedAuthorId = msg.referenced_message?.author?.id;
	if (referencedAuthorId && referencedAuthorId !== msg.author.id) return referencedAuthorId;

	return null;
}

export async function userReactsHandler(msg: GatewayMessageCreateDispatchData) {
	if (msg.guild_id !== globalConfig.supportServerID) return;
	if (msg.author.bot) return;

	const targetUserId = getMentionedOrRepliedUserId(msg);
	if (!targetUserId) return;

	const roboUser = await roboChimpClient.user.findFirst({
		where: {
			id: BigInt(targetUserId),
			react_emoji_id: {
				not: null
			}
		},
		select: {
			react_emoji_id: true
		}
	});
	if (!roboUser?.react_emoji_id) return;

	try {
		await globalClient.addReaction({
			channelId: msg.channel_id,
			messageId: msg.id,
			emojiId: roboUser.react_emoji_id
		});
	} catch (err) {
		console.log(`Failed to react with emoji ID: '${roboUser.react_emoji_id}' ${err}`);
	}
}
