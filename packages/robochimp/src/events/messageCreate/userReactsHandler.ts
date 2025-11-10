import { globalConfig } from "@/constants.js";
import type { GatewayMessageCreateDispatchData } from "@oldschoolgg/discord";

export async function userReactsHandler(msg: GatewayMessageCreateDispatchData) {
	if (msg.guild_id !== globalConfig.supportServerID) return;
	const mentioned = msg.mentions[0];
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
				await globalClient.addReaction({ channelId: msg.channel_id, messageId: msg.id, emojiId: roboUser.react_emoji_id });
			} catch (err) {
				console.log(`Failed to react with emoji ID: ${roboUser.react_emoji_id} ${err}`);
			}
		}
	}
}
