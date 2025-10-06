import type { Message } from 'discord.js';

import { globalConfig } from '@/constants.js';

export async function voteReactionHandler(msg: Message) {
	if (msg.guild?.id !== globalConfig.supportServerID) return;
	if (msg.channelId === '840209128467071006' || msg.content.includes('--vote')) {
		await msg.react('👍');
		await msg.react('👎');
	}
}
