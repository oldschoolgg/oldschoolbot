
import { globalConfig } from '@/constants.js';
import type { IMessage } from '@oldschoolgg/schemas';

export async function voteReactionHandler(msg: IMessage) {
	if (msg.guild_id !== globalConfig.supportServerID) return;
	if (msg.channel_id === '840209128467071006' || msg.content.includes('--vote')) {
		await globalClient.addReaction({ channelId: msg.channel_id, messageId: msg.id, emojiId: '👍' });
		await globalClient.addReaction({ channelId: msg.channel_id, messageId: msg.id, emojiId: '👎' });
	}
}
